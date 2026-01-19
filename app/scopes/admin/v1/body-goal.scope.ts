import { Prisma, Status } from "@prisma/client";

interface BodyGoalScopeQuery {
    name?: string;
    status?: string;
}

export const bodyGoalScope = (query: BodyGoalScopeQuery): Prisma.BodyGoalWhereInput => {
    const { name, status } = query;

    const where: Prisma.BodyGoalWhereInput = {};

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
