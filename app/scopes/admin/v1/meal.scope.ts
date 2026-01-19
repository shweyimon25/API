import { Prisma, Status } from "@prisma/client";

interface MealScopeQuery {
    name?: string;
    status?: string;
    mealTypeId?: string;
}

export const mealScope = (query: MealScopeQuery): Prisma.MealWhereInput => {
    const { name, status, mealTypeId } = query;

    const where: Prisma.MealWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (status) {
        where.status = status as Status;
    }

    if (mealTypeId) {
        where.mealTypeId = +mealTypeId;
    }

    return where;
};
