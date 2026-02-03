import { PrivencyType, Prisma } from "@prisma/client";

interface PostScopeQuery {
    content?: string;
    tagId?: string;
    privencyType?: string;
}

export const postScope = (query: PostScopeQuery): Prisma.PostWhereInput => {
    const { content, tagId, privencyType } = query;

    const where: Prisma.PostWhereInput = {};

    if (content) {
        where.content = {
            equals: JSON.stringify(content)
        };
    }

    if (tagId) {
        where.tagId = +tagId;
    }

    if (privencyType) {
        where.privencyType = privencyType as PrivencyType;
    }

    return where;
};