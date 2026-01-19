import { Prisma, Day, Gender, Status } from "@prisma/client";

interface WorkoutScopeQuery {
    name?: string;
    gender?: string;
    categoryId?: string;
    bodyGoalId?: string;
    placeId?: string;
    memberPlanId?: string;
    workoutDay?: string;
    sets?: string;
    reps?: string;
    status?: string;
}

export const workoutScope = (query: WorkoutScopeQuery): Prisma.WorkoutWhereInput => {
    const { name, gender, categoryId, bodyGoalId, placeId, memberPlanId, workoutDay, sets, reps, status } = query;

    const where: Prisma.WorkoutWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (gender) {
        where.gender = gender as Gender;
    }

    if (categoryId) {
        where.categoryId = +categoryId;
    }

    if (bodyGoalId) {
        where.bodyGoalId = +bodyGoalId;
    }

    if (placeId) {
        where.placeId = +placeId;
    }

    if (memberPlanId) {
        where.memberPlanId = +memberPlanId;
    }

    if (workoutDay) {
        where.workoutDay = workoutDay as Day;
    }

    if (sets) {
        where.sets = {
            gte: +sets,
        };
    }

    if (reps) {
        where.reps = {
            gte: +reps,
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};
