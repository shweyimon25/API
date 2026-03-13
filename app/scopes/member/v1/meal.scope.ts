import { Prisma, Status } from "@prisma/client";

interface MealScopeQuery {
    name?: string;
    mealType?: string;
}

export const mealScope = (query: MealScopeQuery): Prisma.MealWhereInput => {
    const { name, mealType } = query;

    const where: Prisma.MealWhereInput = {
        status: Status.ACTIVE,
    };

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }


    if (mealType) {
        where.mealType = {
            contains: mealType,
            mode: "insensitive",
        };
    }

    return where;
};
