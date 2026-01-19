import { Prisma, Status } from "@prisma/client";

interface ConScopeQuery {
    name?: string;
    status?: string;
}

export const conScope = (query: ConScopeQuery): Prisma.ConsWhereInput => {
    const { name, status } = query;

    const where: Prisma.ConsWhereInput = {};

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