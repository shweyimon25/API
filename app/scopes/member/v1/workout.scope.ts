import { Prisma, Day, Gender } from "@prisma/client";

export interface MemberWorkoutScopeQuery {
  name?: string;
  gender?: string;
  categoryId?: string;
  bodyGoalId?: string;
  placeId?: string;
  memberPlanId?: string;
  workoutDay?: string;
  sets?: string;
  reps?: string;
  fromDate?: string;
  toDate?: string;
}

export const memberWorkoutScope = (query: MemberWorkoutScopeQuery): Prisma.WorkoutWhereInput => {
  const { name, gender, categoryId, bodyGoalId, placeId, memberPlanId, workoutDay, sets, reps, fromDate, toDate } = query;

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

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) {
      where.createdAt.gte = new Date(fromDate);
    }
    if (toDate) {
      where.createdAt.lte = new Date(toDate);
    }
  }

  return where;
};
