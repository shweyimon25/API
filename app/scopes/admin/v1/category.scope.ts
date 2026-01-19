import { Prisma, Status } from "@prisma/client";

interface CategoryScopeQuery {
    name?: string;
    status?: string;
}

export const categoryScope = (query: CategoryScopeQuery): Prisma.CategoryWhereInput => {
    const { name, status } = query;

    const where: Prisma.CategoryWhereInput = {};

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
