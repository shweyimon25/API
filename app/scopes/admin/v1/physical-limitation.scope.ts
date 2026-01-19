import { Prisma, Status } from "@prisma/client";

interface PhysicalLimitationScopeQuery {
    status?: string;
}

export const physicalLimitationScope = (query: PhysicalLimitationScopeQuery): Prisma.PhysicalLimitationWhereInput => {
    const { status } = query;

    const where: Prisma.PhysicalLimitationWhereInput = {};

    if (status) {
        where.status = status as Status;
    }

    return where;
};
