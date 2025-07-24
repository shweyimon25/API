import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createDietarySchema,
  updateDietarySchema,
} from "../../../schemas/admin/v1/dietary.schema";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { DietaryCollection } from "../../../resources/admin/v1/dietary/dietary.collection";
import { DietaryResource } from "../../../resources/admin/v1/dietary/dietary.resource";
import DietaryService from "../../../services/admin/v1/dietary.service";

class DietaryController {
  private dietaryService: DietaryService;

  constructor() {
    this.dietaryService = new DietaryService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const dietaries = await this.dietaryService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Dietary list successfully",
        DietaryCollection.withPagination(dietaries)
      );
    }

    const dietaries = await this.dietaryService.findAll();

    return successResponse(
      res,
      "Dietary list successfully",
      DietaryCollection.toCollection(dietaries)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const dietary = await this.dietaryService.findOne(+id);

    return successResponse(
      res,
      "Dietary detail successfully",
      DietaryResource.toResource(dietary)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createDietarySchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Dietary created failed", error);
    }

    const dietary = await this.dietaryService.create(data);
    return successResponse(
      res,
      "Dietary created successfully",
      DietaryResource.toResource(dietary)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingDietary = await prisma.dietary.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingDietary) {
        throw new ValidationException("Dietary updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateDietarySchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Dietary updated failed", error);
    }

    const dietary = await this.dietaryService.update(+id, data);
    return successResponse(
      res,
      "Dietary updated successfully",
      DietaryResource.toResource(dietary)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.dietaryService.destroy(+id);
    return successResponse(res, "Dietary deleted successfully");
  }
}

export default DietaryController;
