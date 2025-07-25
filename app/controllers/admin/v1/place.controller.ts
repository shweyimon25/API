import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import PlaceService from "../../../services/admin/v1/place.service";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { PlaceCollection } from "../../../resources/admin/v1/place/place.collection";
import { PlaceResource } from "../../../resources/admin/v1/place/place.resource";
import { createPlaceSchema, updatePlaceSchema } from "../../../schemas/admin/v1/place.schema";

class PlaceController {
  private placeService: PlaceService;

  constructor() {
    this.placeService = new PlaceService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

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
    const { id } = req.params;
    const place = await this.placeService.findOne(+id);
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
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingPlace = await prisma.place.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingPlace) {
        throw new ValidationException("Place updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updatePlaceSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Place updated failed", error);
    }

    const place = await this.placeService.update(+id, data);
    return successResponse(
      res,
      "Place updated successfully",
      PlaceResource.toResource(place)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.placeService.destroy(+id);
    return successResponse(res, "Place deleted successfully");
  }
}

export default PlaceController;
