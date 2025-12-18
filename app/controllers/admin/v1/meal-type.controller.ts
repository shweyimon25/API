import { Request, Response } from "express";
import MealTypeService from "../../../services/admin/v1/meal-type.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createMealTypeSchema,
  updateMealTypeSchema,
} from "../../../schemas/admin/v1/meal-type.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { MealTypeCollection } from "../../../resources/admin/v1/meal-type/meal-type.collection";
import { MealTypeResource } from "../../../resources/admin/v1/meal-type/meal-type.resource";

class MealTypeController {
  private mealTypeService: MealTypeService;

  constructor() {
    this.mealTypeService = new MealTypeService();
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
      const mealTypes = await this.mealTypeService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Meal type list successfully",
        MealTypeCollection.withPagination(mealTypes)
      );
    }

    const mealTypes = await this.mealTypeService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Meal type list successfully",
      MealTypeCollection.toCollection(mealTypes)
    );
  }

  async findOne(req: Request, res: Response) {
    const mealType = await this.mealTypeService.findOne(+req.params.id);
    return successResponse(
      res,
      "Meal type details successfully",
      MealTypeResource.toResource(mealType)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createMealTypeSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create meal type", error);
    }

    const userId = (req.user as any)?.id;
    const mealType = await this.mealTypeService.create(data, userId);
    return successResponse(
      res,
      "Meal type created successfully",
      MealTypeResource.toResource(mealType)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateMealTypeSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update meal type", error);
    }

    const userId = (req.user as any)?.id;
    const mealType = await this.mealTypeService.update(+req.params.id, data, userId);
    return successResponse(
      res,
      "Meal type updated successfully",
      MealTypeResource.toResource(mealType)
    );
  }

  async destroy(req: Request, res: Response) {
    const mealType = await this.mealTypeService.destroy(+req.params.id);
    return successResponse(
      res,
      "Meal type deleted successfully",
      MealTypeResource.toResource(mealType)
    );
  }
}

export default MealTypeController;

