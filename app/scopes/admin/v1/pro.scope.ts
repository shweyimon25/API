import { Prisma, Status } from "@prisma/client";

interface ProScopeQuery {
    name?: string;
    status?: string;
}

export const proScope = (query: ProScopeQuery): Prisma.ProsWhereInput => {
    const { name, status } = query;

    const where: Prisma.ProsWhereInput = {};

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