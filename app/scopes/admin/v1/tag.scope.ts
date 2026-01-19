import { Prisma, Status } from "@prisma/client";

interface TagScopeQuery {
    name?: string;
    status?: string;
}

export const tagScope = (query: TagScopeQuery): Prisma.TagWhereInput => {
    const {
        name,
        status,
    } = query;

    const where: Prisma.TagWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};