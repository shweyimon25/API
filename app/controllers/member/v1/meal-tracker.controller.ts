import { Request, Response } from "express";
import { Member } from "@prisma/client";
import MealTrackerService from "../../../services/member/v1/meal-tracker.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
    createMealTrackerSchema,
    updateMealTrackerSchema,
} from "../../../schemas/member/v1/meal-tracker.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { MealTrackerResource } from "../../../resources/member/v1/meal-tracker/meal-tracker.resource";

class MealTrackerController {
    private mealTrackerService: MealTrackerService;

    constructor() {
        this.mealTrackerService = new MealTrackerService();
    }

    async findAll(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { date } = req.query;

        const targetDate = String(date || "");

        if (!targetDate) {
            throw new ValidationException("Date is required", [
                {
                    field: "date",
                    issue: "Date is required",
                },
            ]);
        }

        const trackers = await this.mealTrackerService.findAll(memberId, { date: targetDate });

        return successResponse(
            res,
            "Meal tracker list successfully",
            MealTrackerResource.withSummary(targetDate, trackers),
        );
    }

    async findOne(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { id } = req.params;

        const tracker = await this.mealTrackerService.findOne(memberId, +id);

        return successResponse(
            res,
            "Meal tracker found successfully",
            MealTrackerResource.toItem(tracker),
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createMealTrackerSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to create meal tracker", error);
        }

        const memberId = (req.user as Member).id;
        const tracker = await this.mealTrackerService.create(memberId, data);

        return successResponse(
            res,
            "Meal tracker created successfully",
            MealTrackerResource.toItem(tracker),
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateMealTrackerSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update meal tracker", error);
        }

        const memberId = (req.user as Member).id;
        const { id } = req.params;

        const tracker = await this.mealTrackerService.update(memberId, +id, data);

        return successResponse(
            res,
            "Meal tracker updated successfully",
            MealTrackerResource.toItem(tracker),
        );
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { id } = req.params;

        await this.mealTrackerService.destroy(memberId, +id);

        return successResponse(res, "Meal tracker deleted successfully");
    }
}

export default MealTrackerController;

