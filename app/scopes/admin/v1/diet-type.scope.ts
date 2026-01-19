import { Prisma, Status } from "@prisma/client";

interface DietTypeScopeQuery {
    status?: string;
}

export const dietTypeScope = (query: DietTypeScopeQuery): Prisma.DietTypeWhereInput => {
    const { status } = query;

    const where: Prisma.DietTypeWhereInput = {};

    if (status) {
        where.status = status as Status;
    }

    return where;
};
