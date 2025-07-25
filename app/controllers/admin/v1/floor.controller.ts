import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import FloorService from "../../../services/admin/v1/floor.service";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { FloorResource } from "../../../resources/admin/v1/floor/floor.resource";
import { FloorCollection } from "../../../resources/admin/v1/floor/floor.collection";
import {
  createFloorSchema,
  updateFloorSchema,
} from "../../../schemas/admin/v1/floor.schema";

class FloorController {
  private floorService: FloorService;

  constructor() {
    this.floorService = new FloorService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const floors = await this.floorService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Floor list successfully",
        FloorCollection.withPagination(floors)
      );
    }

    const floors = await this.floorService.findAll();
    return successResponse(
      res,
      "Floor list successfully",
      FloorCollection.toCollection(floors)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const floor = await this.floorService.findOne(+id);
    return successResponse(
      res,
      "Floor detail successfully",
      FloorResource.toResource(floor)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createFloorSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Floor created failed", error);
    }

    const floor = await this.floorService.create(data);
    return successResponse(
      res,
      "Floor created successfully",
      FloorResource.toResource(floor)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingFloor = await prisma.floor.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingFloor) {
        throw new ValidationException("Floor updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateFloorSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Floor updated failed", error);
    }

    const floor = await this.floorService.update(+id, data);
    return successResponse(
      res,
      "Floor updated successfully",
      FloorResource.toResource(floor)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.floorService.destroy(+id);
    return successResponse(res, "Floor deleted successfully");
  }
}

export default FloorController;
