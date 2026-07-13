import { Prisma } from "@prisma/client";

export interface MemberPostScopeQuery {
    caption?: string;
    postCategoryId?: string;
    fromDate?: string;
    toDate?: string;
}

export const memberPostScope = (query: MemberPostScopeQuery): Prisma.PostWhereInput => {
    const { caption, postCategoryId, fromDate, toDate } = query;

    const where: Prisma.PostWhereInput = {};

    if (caption) {
        where.caption = {
            equals: JSON.stringify(caption)
        };
    }

    if (postCategoryId) {
        where.postCategoryId = +postCategoryId;
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
