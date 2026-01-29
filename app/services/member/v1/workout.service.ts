import { NotFoundException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { Prisma, Status } from "@prisma/client";

/** Member API: always only ACTIVE workouts (no status in scope) */
const memberWorkoutWhere = (where?: Prisma.WorkoutWhereInput): Prisma.WorkoutWhereInput => ({
  status: Status.ACTIVE,
  ...where,
});

const workoutInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  bodyGoal: {
    select: {
      id: true,
      name: true,
    },
  },
  proficientLevel: {
    select: {
      id: true,
      name: true,
    },
  },
  place: {
    select: {
      id: true,
      name: true,
    },
  },
  memberPlan: {
    select: {
      id: true,
      name: true,
    },
  },
};

class WorkoutService {
  async findAll(where?: Prisma.WorkoutWhereInput) {
    const workouts = await prisma.workout.findMany({
      where: memberWorkoutWhere(where),
      orderBy: { id: "desc" },
      include: workoutInclude,
    });
    return workouts;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.WorkoutWhereInput) {
    const workouts = await prisma.workout.findMany({
      where: memberWorkoutWhere(where),
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: workoutInclude,
    });

    const totalWorkouts = await prisma.workout.count({
      where: memberWorkoutWhere(where),
    });

    return {
      data: workouts,
      meta: {
        totalCount: totalWorkouts,
        totalPages: Math.ceil(totalWorkouts / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalWorkouts / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalWorkouts / perPage),
      },
    };
  }

  async findOne(id: number) {
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        status: Status.ACTIVE,
      },
      include: workoutInclude,
    });

    if (!workout) {
      throw new NotFoundException("Workout not found");
    }

    return workout;
  }

  async findCommonAll(where?: Prisma.WorkoutWhereInput) {
    const workouts = await prisma.workout.findMany({
      where: memberWorkoutWhere(where),
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
      },
    });
    return workouts;
  }
}

export default WorkoutService;
