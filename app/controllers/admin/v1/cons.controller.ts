import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import ConsService from "../../../services/admin/v1/cons.service";
import { validater } from "../../../helpers/validator";
import {
  createConsSchema,
  updateConsSchema,
} from "../../../schemas/admin/v1/cons.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { ConsCollection } from "../../../resources/admin/v1/cons/cons.collection";
import { ConsResource } from "../../../resources/admin/v1/cons/cons.resource";

class ConsController {
  private consService: ConsService;

  constructor() {
    this.consService = new ConsService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10, status, search } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search as string;
    }

    if (page && perPage) {
      const cons = await this.consService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Cons list successfully",
        ConsCollection.withPagination(cons)
      );
    }

    const cons = await this.consService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Cons list successfully",
      ConsCollection.toCollection(cons)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const cons = await this.consService.findOne(+id);
    return successResponse(
      res,
      "Cons detail successfully",
      ConsResource.toResource(cons)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createConsSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Cons created failed", error);
    }

    const cons = await this.consService.create(data);

    return successResponse(
      res,
      "Cons created successfully",
      ConsResource.toResource(cons)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { data, error, success } = await validater(
      updateConsSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Cons updated failed", error);
    }

    const cons = await this.consService.update(+id, data);

    return successResponse(
      res,
      "Cons updated successfully",
      ConsResource.toResource(cons)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.consService.destroy(+id);

    return successResponse(res, "Cons deleted successfully");
  }
}

export default ConsController;

