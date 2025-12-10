import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import WorkoutService from "../../../services/admin/v1/workout.service";
import { WorkoutCollection } from "../../../resources/admin/v1/workout/workout.collection";
import { WorkoutResource } from "../../../resources/admin/v1/workout/workout.resource";
import { createWorkoutSchema, updateWorkoutSchema } from "../../../schemas/admin/v1/workout.schema";

class WorkoutController {
    private workoutService: WorkoutService;

    constructor() {
        this.workoutService = new WorkoutService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        if (page && perPage) {
            const workouts = await this.workoutService.findByPaginate(+page, +perPage);
            return successResponse(
                res,
                "Workout list successfully",
                WorkoutCollection.withPagination(workouts)
            );
        }

        const workouts = await this.workoutService.findAll();
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
            "Wrokout details successfully",
            WorkoutResource.toResource(workout)
        );
    }

    async create(req: Request, res: Response) {
        const { data, error } = await validater(createWorkoutSchema, req.body);

        if (error) {
            throw new ValidationException("Failed to create workout", error);
        }

        const userId = (req.user as any)?.id;
        const workout = await this.workoutService.create(data, userId);
        return successResponse(
            res,
            "Workout created successfully",
            WorkoutResource.toResource(workout)
        );
    }

    async update(req: Request, res: Response) {
        const { data, error } = await validater(updateWorkoutSchema, req.body);

        if (error) {
            throw new ValidationException("Failed to update tag", error);
        }

        const userId = (req.user as any)?.id;
        const workout = await this.workoutService.update(+req.params.id, data, userId);
        return successResponse(
            res,
            "Wrokout updated successfully",
            WorkoutResource.toResource(workout)
        );
    }

    async destroy(req: Request, res: Response) {
        const workout = await this.workoutService.destroy(+req.params.id);
        return successResponse(
            res,
            "Wrokout deleted successfully",
            WorkoutResource.toResource(workout)
        );
    }
}

export default WorkoutController;

