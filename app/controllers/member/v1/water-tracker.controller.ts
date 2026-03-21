import { Request, Response } from "express";
import { Member } from "@prisma/client";
import WaterTrackerService from "../../../services/member/v1/water-tracker.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
    createWaterTrackerSchema,
    updateWaterTrackerSchema,
} from "../../../schemas/member/v1/water-tracker.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { WaterTrackerResource } from "../../../resources/member/v1/water-tracker/water-tracker.resource";

class WaterTrackerController {
    private waterTrackerService: WaterTrackerService;

    constructor() {
        this.waterTrackerService = new WaterTrackerService();
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

        const trackers = await this.waterTrackerService.findAll(memberId, {
            date: targetDate,
        });

        return successResponse(
            res,
            "Water tracker list successfully",
            WaterTrackerResource.withSummary(targetDate, trackers),
        );
    }

    async findOne(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { id } = req.params;

        const tracker = await this.waterTrackerService.findOne(memberId, +id);

        return successResponse(
            res,
            "Water tracker found successfully",
            WaterTrackerResource.toItem(tracker),
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(
            createWaterTrackerSchema,
            req.body,
        );

        if (!success) {
            throw new ValidationException("Failed to create water tracker", error);
        }

        const memberId = (req.user as Member).id;
        const tracker = await this.waterTrackerService.create(memberId, data);

        return successResponse(
            res,
            "Water tracker saved successfully",
            WaterTrackerResource.toItem(tracker),
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(
            updateWaterTrackerSchema,
            req.body,
        );

        if (!success) {
            throw new ValidationException("Failed to update water tracker", error);
        }

        const memberId = (req.user as Member).id;
        const { id } = req.params;

        const tracker = await this.waterTrackerService.update(memberId, +id, data);

        return successResponse(
            res,
            "Water tracker updated successfully",
            WaterTrackerResource.toItem(tracker),
        );
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { id } = req.params;

        await this.waterTrackerService.destroy(memberId, +id);

        return successResponse(res, "Water tracker deleted successfully");
    }
}

export default WaterTrackerController;
