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
import { badHabitScope } from "../../../scopes/admin/v1/bad-habit.scope";

class BadHabitController {
  private badHabitService: BadHabitService;

  constructor() {
    this.badHabitService = new BadHabitService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = badHabitScope(req.query);

    if (page && perPage) {
      const badHabits = await this.badHabitService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Bad habit list successfully",
        BadHabitCollection.withPagination(badHabits)
      );
    }

    const badHabits = await this.badHabitService.findAll(where);
    return successResponse(
      res,
      "Bad habit list successfully",
      BadHabitCollection.toCollection(badHabits)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = badHabitScope(req.query);

    const badHabits = await this.badHabitService.findCommonAll(where);
    
    return successResponse(
      res,
      "Bad habit list successfully",
      BadHabitCollection.toCommonCollection(badHabits)
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
    const { data, success, error } = await validater(createBadHabitSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to create bad habit", error);
    }

    const userId = (req.user as any)?.id;
    const badHabit = await this.badHabitService.create(data, userId, req.files as Express.Multer.File[]);
    return successResponse(
      res,
      "Bad habit created successfully",
      BadHabitResource.toResource(badHabit)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(updateBadHabitSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to update bad habit", error);
    }

    const userId = (req.user as any)?.id;
    const badHabit = await this.badHabitService.update(
      +req.params.id,
      data,
      userId,
      req.files as Express.Multer.File[]
    );
    return successResponse(
      res,
      "Bad habit updated successfully",
      BadHabitResource.toResource(badHabit)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.badHabitService.destroy(+req.params.id);
    return successResponse(res, "Bad habit deleted successfully");
  }
}

export default BadHabitController;
