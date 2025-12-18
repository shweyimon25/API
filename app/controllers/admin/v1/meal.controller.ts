import { Request, Response } from "express";
import MealService from "../../../services/admin/v1/meal.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createMealSchema,
  updateMealSchema,
} from "../../../schemas/admin/v1/meal.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { MealCollection } from "../../../resources/admin/v1/meal/meal.collection";
import { MealResource } from "../../../resources/admin/v1/meal/meal.resource";

class MealController {
  private mealService: MealService;

  constructor() {
    this.mealService = new MealService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, status, search, mealTypeId } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search as string;
    }
    if (mealTypeId) {
      filters.mealTypeId = +mealTypeId;
    }

    if (page && perPage) {
      const meals = await this.mealService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Meal list successfully",
        MealCollection.withPagination(meals)
      );
    }

    const meals = await this.mealService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Meal list successfully",
      MealCollection.toCollection(meals)
    );
  }

  async findOne(req: Request, res: Response) {
    const meal = await this.mealService.findOne(+req.params.id);
    return successResponse(
      res,
      "Meal details successfully",
      MealResource.toResource(meal)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createMealSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create meal", error);
    }

    const userId = (req.user as any)?.id;
    const meal = await this.mealService.create(data, userId);
    return successResponse(
      res,
      "Meal created successfully",
      MealResource.toResource(meal)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateMealSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update meal", error);
    }

    const userId = (req.user as any)?.id;
    const meal = await this.mealService.update(+req.params.id, data, userId);
    return successResponse(
      res,
      "Meal updated successfully",
      MealResource.toResource(meal)
    );
  }

  async destroy(req: Request, res: Response) {
    const meal = await this.mealService.destroy(+req.params.id);
    return successResponse(
      res,
      "Meal deleted successfully",
      MealResource.toResource(meal)
    );
  }
}

export default MealController;

