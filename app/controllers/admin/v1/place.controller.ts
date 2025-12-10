import { PlaceCollection } from "./../../../resources/admin/v1/place/place.collection";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import PlaceService from "../../../services/admin/v1/place.service";
import { PlaceResource } from "../../../resources/admin/v1/place/place.resource";
import {
  createPlaceSchema,
  updatePlaceSchema,
} from "../../../schemas/admin/v1/place.schema";

class PlaceController {
  private placeService: PlaceService;

  constructor() {
    this.placeService = new PlaceService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const places = await this.placeService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Place list successfully",
        PlaceCollection.withPagination(places)
      );
    }

    const places = await this.placeService.findAll();

    return successResponse(
      res,
      "Place list successfully",
      PlaceCollection.toCollection(places)
    );
  }

  async findOne(req: Request, res: Response) {
    const place = await this.placeService.findOne(+req.params.id);

    return successResponse(
      res,
      "Place detail successfully",
      PlaceResource.toResource(place)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createPlaceSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Place created failed", error);
    }

    const place = await this.placeService.create(data);

    return successResponse(
      res,
      "Place created successfully",
      PlaceResource.toResource(place)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updatePlaceSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Place updated failed", error);
    }

    const place = await this.placeService.update(+req.params.id, data);

    return successResponse(
      res,
      "Place updated successfully",
      PlaceResource.toResource(place)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.placeService.destroy(+req.params.id);
    return successResponse(res, "Place deleted successfully");
  }
}

export default PlaceController;
