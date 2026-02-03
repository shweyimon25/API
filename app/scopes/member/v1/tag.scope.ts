import { Prisma } from "@prisma/client";
export interface MemberTagScopeQuery {
    name?: string;
}

export const memberTagScope = (query: MemberTagScopeQuery): Prisma.TagWhereInput => {
    const { name } = query;

    const where: Prisma.TagWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    return where;
};
