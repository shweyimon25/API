import { Prisma, Status } from "@prisma/client";

interface ProficientLevelScopeQuery {
    name?: string;
    status?: string;
}

export const proficientLevelScope = (query: ProficientLevelScopeQuery): Prisma.ProficientLevelWhereInput => {
    const { name, status } = query;

    const where: Prisma.ProficientLevelWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};
