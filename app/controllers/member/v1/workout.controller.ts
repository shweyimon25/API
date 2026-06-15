import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import WorkoutService from "../../../services/member/v1/workout.service";
import { WorkoutCollection } from "../../../resources/member/v1/workout/workout.collection";
import { WorkoutResource } from "../../../resources/member/v1/workout/workout.resource";
import { memberWorkoutScope } from "../../../scopes/member/v1/workout.scope";
import prisma from "../../../../prisma/client";
import {
  buildDurationMap,
  buildPersonalWorkoutWhere,
  formatPersonalWorkout,
  personalWorkoutInclude,
} from "../../../helpers/personal-workout.helper";

class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  async personalWorkout(req: Request, res: Response) {
    const params = req.body?.params ?? {};
    const filters = params.filters;
    const offset = Number(params.offset ?? 0);
    const limit = Number(params.limit ?? 10);
    const where = buildPersonalWorkoutWhere(filters);

    const [count, workouts, planDurations] = await Promise.all([
      prisma.workout.count({ where }),
      prisma.workout.findMany({
        where,
        orderBy: { id: "desc" },
        skip: Number.isFinite(offset) && offset > 0 ? offset : 0,
        take: Number.isFinite(limit) && limit > 0 ? limit : 10,
        include: personalWorkoutInclude,
      }),
      prisma.planDuration.findMany(),
    ]);

    const durationMap = buildDurationMap(planDurations);
    const results = workouts.map((workout) =>
      formatPersonalWorkout(workout, durationMap)
    );

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count,
          results,
        },
      },
    });
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    const where = memberWorkoutScope(req.query);

    if (page && perPage) {
      const workouts = await this.workoutService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Workout list successfully",
        WorkoutCollection.withPagination(workouts)
      );
    }

    const workouts = await this.workoutService.findAll(where);
    return successResponse(
      res,
      "Workout list successfully",
      WorkoutCollection.toCollection(workouts)
    );
  }

  async findOne(req: Request, res: Response) {
    const workout = await this.workoutService.findOne(+req.params.id);
    return successResponse(
      res,
      "Workout details successfully",
      WorkoutResource.toResource(workout)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = memberWorkoutScope(req.query);
    const workouts = await this.workoutService.findCommonAll(where);
    return successResponse(
      res,
      "Common workout list successfully",
      WorkoutCollection.toCommonCollection(workouts)
    );
  }
}

export default WorkoutController;
