import { Request, Response } from "express";
import WaterTrackerService from "../../../services/admin/v1/water-tracker.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createWaterTrackerSchema,
  updateWaterTrackerSchema,
} from "../../../schemas/admin/v1/water-tracker.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { WaterTrackerCollection } from "../../../resources/admin/v1/water-tracker/water-tracker.collection";
import { WaterTrackerResource } from "../../../resources/admin/v1/water-tracker/water-tracker.resource";

class WaterTrackerController {
  private waterTrackerService: WaterTrackerService;

  constructor() {
    this.waterTrackerService = new WaterTrackerService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, memberId, date } = req.query;

    const filters: any = {};
    if (memberId) {
      filters.memberId = +memberId;
    }
    if (date) {
      filters.date = date as string;
    }

    if (page && perPage) {
      const waterTrackers = await this.waterTrackerService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Water tracker list successfully",
        WaterTrackerCollection.withPagination(waterTrackers)
      );
    }

    const waterTrackers = await this.waterTrackerService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Water tracker list successfully",
      WaterTrackerCollection.toCollection(waterTrackers)
    );
  }

  async findOne(req: Request, res: Response) {
    const waterTracker = await this.waterTrackerService.findOne(+req.params.id);
    return successResponse(
      res,
      "Water tracker details successfully",
      WaterTrackerResource.toResource(waterTracker)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createWaterTrackerSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create water tracker", error);
    }

    const waterTracker = await this.waterTrackerService.create(data);
    return successResponse(
      res,
      "Water tracker created successfully",
      WaterTrackerResource.toResource(waterTracker)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateWaterTrackerSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update water tracker", error);
    }

    const waterTracker = await this.waterTrackerService.update(
      +req.params.id,
      data
    );
    return successResponse(
      res,
      "Water tracker updated successfully",
      WaterTrackerResource.toResource(waterTracker)
    );
  }

  async destroy(req: Request, res: Response) {
    const waterTracker = await this.waterTrackerService.destroy(+req.params.id);
    return successResponse(
      res,
      "Water tracker deleted successfully",
      WaterTrackerResource.toResource(waterTracker)
    );
  }
}

export default WaterTrackerController;

