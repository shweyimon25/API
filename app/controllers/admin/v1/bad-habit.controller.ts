import { Request, Response } from "express";
import BadHabitService from "../../../services/admin/v1/bad-habit.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createBadHabitSchema,
  updateBadHabitSchema,
} from "../../../schemas/admin/v1/bad-habit.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { BadHabitCollection } from "../../../resources/admin/v1/bad-habit/bad-habit.collection";
import { BadHabitResource } from "../../../resources/admin/v1/bad-habit/bad-habit.resource";

class BadHabitController {
  private badHabitService: BadHabitService;

  constructor() {
    this.badHabitService = new BadHabitService();
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
      const badHabits = await this.badHabitService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Bad habit list successfully",
        BadHabitCollection.withPagination(badHabits)
      );
    }

    const badHabits = await this.badHabitService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Bad habit list successfully",
      BadHabitCollection.toCollection(badHabits)
    );
  }

  async findOne(req: Request, res: Response) {
    const badHabit = await this.badHabitService.findOne(+req.params.id);
    return successResponse(
      res,
      "Bad habit details successfully",
      BadHabitResource.toResource(badHabit)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createBadHabitSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create bad habit", error);
    }

    const userId = (req.user as any)?.id;
    const badHabit = await this.badHabitService.create(data, userId);
    return successResponse(
      res,
      "Bad habit created successfully",
      BadHabitResource.toResource(badHabit)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateBadHabitSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update bad habit", error);
    }

    const userId = (req.user as any)?.id;
    const badHabit = await this.badHabitService.update(+req.params.id, data, userId);
    return successResponse(
      res,
      "Bad habit updated successfully",
      BadHabitResource.toResource(badHabit)
    );
  }

  async destroy(req: Request, res: Response) {
    const badHabit = await this.badHabitService.destroy(+req.params.id);
    return successResponse(
      res,
      "Bad habit deleted successfully",
      BadHabitResource.toResource(badHabit)
    );
  }
}

export default BadHabitController;

