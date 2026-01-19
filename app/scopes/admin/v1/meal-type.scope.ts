import { Prisma, Status } from "@prisma/client";

interface MealTypeScopeQuery {
    status?: string;
}

export const mealTypeScope = (query: MealTypeScopeQuery): Prisma.MealTypeWhereInput => {
    const { status } = query;

    const where: Prisma.MealTypeWhereInput = {};

    if (status) {
        where.status = status as Status;
    }

    return where;
};
