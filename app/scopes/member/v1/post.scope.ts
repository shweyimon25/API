import { Prisma } from "@prisma/client";

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
            equals: JSON.stringify(content)
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
