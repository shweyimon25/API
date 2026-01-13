import { Request, Response } from "express";
import DietTypeService from "../../../services/admin/v1/diet-type.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createDietTypeSchema,
  updateDietTypeSchema,
} from "../../../schemas/admin/v1/diet-type.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { DietTypeCollection } from "../../../resources/admin/v1/diet-type/diet-type.collection";
import { DietTypeResource } from "../../../resources/admin/v1/diet-type/diet-type.resource";
import { Prisma, Status } from "@prisma/client";

class DietTypeController {
  private dietTypeService: DietTypeService;

  constructor() {
    this.dietTypeService = new DietTypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, search, status } = req.query;

    let where: Prisma.DietTypeWhereInput = {};

    if (search) {
      where.OR = [{
        name: {
          contains: search as string,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search as string,
          mode: "insensitive",
        },
      }];
    }

    if (status) {
      where.status = status as Status;
    }

    if (page && perPage) {
      const dietTypes = await this.dietTypeService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Diet type list successfully",
        DietTypeCollection.withPagination(dietTypes)
      );
    }

    const dietTypes = await this.dietTypeService.findAll(where);
    return successResponse(
      res,
      "Diet type list successfully",
      DietTypeCollection.toCollection(dietTypes)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { search } = req.query;

    let where: Prisma.DietTypeWhereInput = {};

    if (search) {
      where.OR = [{
        name: {
          contains: search as string,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search as string,
          mode: "insensitive",
        },
      }];
    }

    const dietTypes = await this.dietTypeService.findCommonAll(where);

    return successResponse(
      res,
      "Diet type list successfully",
      DietTypeCollection.toCommonCollection(dietTypes)
    );
  }

  async findOne(req: Request, res: Response) {
    const dietType = await this.dietTypeService.findOne(+req.params.id);
    return successResponse(
      res,
      "Diet type details successfully",
      DietTypeResource.toResource(dietType)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(createDietTypeSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to create diet type", error);
    }

    const userId = (req.user as any)?.id;
    const dietType = await this.dietTypeService.create(data, userId, req.files as Express.Multer.File[]);
    return successResponse(
      res,
      "Diet type created successfully",
      DietTypeResource.toResource(dietType)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(updateDietTypeSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to update diet type", error);
    }

    const userId = (req.user as any)?.id;

    const dietType = await this.dietTypeService.update(+req.params.id, data, userId, req.files as Express.Multer.File[]);
    return successResponse(
      res,
      "Diet type updated successfully",
      DietTypeResource.toResource(dietType)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.dietTypeService.destroy(+req.params.id);
    return successResponse(res, "Diet type deleted successfully");
  }
}

export default DietTypeController;

