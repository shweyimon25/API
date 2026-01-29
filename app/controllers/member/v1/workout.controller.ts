import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import WorkoutService from "../../../services/member/v1/workout.service";
import { WorkoutCollection } from "../../../resources/member/v1/workout/workout.collection";
import { WorkoutResource } from "../../../resources/member/v1/workout/workout.resource";
import { memberWorkoutScope } from "../../../scopes/member/v1/workout.scope";

class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
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
