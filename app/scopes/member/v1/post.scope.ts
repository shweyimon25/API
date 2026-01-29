import { Prisma } from "@prisma/client";

/** Member post scope: no status filter – member API always returns ACTIVE posts only */
export interface MemberPostScopeQuery {
    content?: string;
    tagId?: string;
    fromDate?: string;
    toDate?: string;
}

export const memberPostScope = (query: MemberPostScopeQuery): Prisma.PostWhereInput => {
    const { content, tagId, fromDate, toDate } = query;

    const where: Prisma.PostWhereInput = {};

    if (content) {
        where.content = {
            contains: content,
            mode: "insensitive",
        };
    }
    if (tagId) {
        where.tagId = +tagId;
    }
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) {
            where.createdAt.gte = new Date(fromDate);
        }
        if (toDate) {
            where.createdAt.lte = new Date(toDate);
        }
    }

    return where;
};
