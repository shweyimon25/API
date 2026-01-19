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
import { mealTypeScope } from "../../../scopes/admin/v1/meal-type.scope";

class MealTypeController {
  private mealTypeService: MealTypeService;

  constructor() {
    this.mealTypeService = new MealTypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = mealTypeScope(req.query);

    if (page && perPage) {
      const mealTypes = await this.mealTypeService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Meal type list successfully",
        MealTypeCollection.withPagination(mealTypes)
      );
    }

    const mealTypes = await this.mealTypeService.findAll(where);
    return successResponse(
      res,
      "Meal type list successfully",
      MealTypeCollection.toCollection(mealTypes)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = mealTypeScope(req.query);

    const mealTypes = await this.mealTypeService.findCommonAll(where);

    return successResponse(
      res,
      "Common Meal type list successfully",
      MealTypeCollection.toCommonCollection(mealTypes)
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
    const { data, success, error } = await validater(createMealTypeSchema, req.body);

    if (!success) {
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
    const { data, success, error } = await validater(updateMealTypeSchema, req.body);

    if (!success) {
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
    await this.mealTypeService.destroy(+req.params.id);
    return successResponse(res, "Meal type deleted successfully");
  }
}

export default MealTypeController;

