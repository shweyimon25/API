import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import WorkoutService from "../../../services/admin/v1/workout.service";
import { WorkoutCollection } from "../../../resources/admin/v1/workout/workout.collection";
import { WorkoutResource } from "../../../resources/admin/v1/workout/workout.resource";
import { createWorkoutSchema, updateWorkoutSchema } from "../../../schemas/admin/v1/workout.schema";
import { workoutScope } from "../../../scopes/admin/v1/workout.scope";

class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = workoutScope(req.query);

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
    const where = workoutScope(req.query);

    const workouts = await this.workoutService.findCommonAll(where);

    return successResponse(
      res,
      "Common workout list successfully",
      WorkoutCollection.toCommonCollection(workouts)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(createWorkoutSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to create workout", error);
    }

    const userId = (req.user as any)?.id;
    const workout = await this.workoutService.create(data, req.files as Express.Multer.File[], userId);

    return successResponse(
      res,
      "Workout created successfully",
      WorkoutResource.toResource(workout)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(updateWorkoutSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to update workout", error);
    }

    const userId = (req.user as any)?.id;
    const workout = await this.workoutService.update(+req.params.id, data, req.files as Express.Multer.File[], userId);
    return successResponse(
      res,
      "Workout updated successfully",
      WorkoutResource.toResource(workout)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.workoutService.destroy(+req.params.id);
    return successResponse(res, "Workout deleted successfully");
  }
}

export default WorkoutController;
