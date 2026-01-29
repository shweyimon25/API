import { Prisma } from "@prisma/client";

/** Member tag scope: no status filter – member API always returns ACTIVE tags only */
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
