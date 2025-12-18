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

class DietTypeController {
  private dietTypeService: DietTypeService;

  constructor() {
    this.dietTypeService = new DietTypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, status, search } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search as string;
    }

    if (page && perPage) {
      const dietTypes = await this.dietTypeService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Diet type list successfully",
        DietTypeCollection.withPagination(dietTypes)
      );
    }

    const dietTypes = await this.dietTypeService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Diet type list successfully",
      DietTypeCollection.toCollection(dietTypes)
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
    const { data, error } = await validater(createDietTypeSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create diet type", error);
    }

    const userId = (req.user as any)?.id;
    const dietType = await this.dietTypeService.create(data, userId);
    return successResponse(
      res,
      "Diet type created successfully",
      DietTypeResource.toResource(dietType)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateDietTypeSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update diet type", error);
    }

    const userId = (req.user as any)?.id;
    const dietType = await this.dietTypeService.update(+req.params.id, data, userId);
    return successResponse(
      res,
      "Diet type updated successfully",
      DietTypeResource.toResource(dietType)
    );
  }

  async destroy(req: Request, res: Response) {
    const dietType = await this.dietTypeService.destroy(+req.params.id);
    return successResponse(
      res,
      "Diet type deleted successfully",
      DietTypeResource.toResource(dietType)
    );
  }
}

export default DietTypeController;

