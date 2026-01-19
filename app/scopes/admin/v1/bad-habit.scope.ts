import { Prisma, Status } from "@prisma/client";

interface BadHabitScopeQuery {
    name?: string;
    status?: string;
}

export const badHabitScope = (query: BadHabitScopeQuery): Prisma.BadHabitWhereInput => {
    const { name, status } = query;

    const where: Prisma.BadHabitWhereInput = {};

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
