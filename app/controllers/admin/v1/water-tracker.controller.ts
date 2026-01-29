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
import { waterTrackerScope } from "../../../scopes/admin/v1/water-tracker.scope";

class WaterTrackerController {
  private waterTrackerService: WaterTrackerService;

  constructor() {
    this.waterTrackerService = new WaterTrackerService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = waterTrackerScope(req.query);

    if (page && perPage) {
      const waterTrackers = await this.waterTrackerService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Water tracker list successfully",
        WaterTrackerCollection.withPagination(waterTrackers)
      );
    }

    const waterTrackers = await this.waterTrackerService.findAll(where);
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
    const { data, success, error } = await validater(createWaterTrackerSchema, req.body);

    if (!success) {
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
    const { data, success, error } = await validater(updateWaterTrackerSchema, req.body);

    if (!success) {
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
    await this.waterTrackerService.destroy(+req.params.id);
    return successResponse(res, "Water tracker deleted successfully");
  }
}

export default WaterTrackerController;

