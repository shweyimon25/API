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
import { Prisma, Status } from "@prisma/client";

class ConsController {
  private consService: ConsService;

  constructor() {
    this.consService = new ConsService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name, guard, status } = req.query;

    let where: Prisma.ConsWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    if (guard) {
      where.guard = {
        contains: guard as string,
      };
    }

    if (status) {
      where.status = status as Status;
    }

    if (page && perPage) {
      const cons = await this.consService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Cons list successfully",
        ConsCollection.withPagination(cons)
      );
    }

    const cons = await this.consService.findAll(where);
    return successResponse(
      res,
      "Cons list successfully",
      ConsCollection.toCollection(cons)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { name, guard } = req.query;

    let where: Prisma.ConsWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    if (guard) {
      where.guard = {
        contains: guard as string,
      };
    }

    const cons = await this.consService.findCommonAll(where);

    return successResponse(
      res,
      "Common cons list successfully",
      ConsCollection.toCommonCollection(cons)
    )
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

    const cons = await this.consService.create(data, (req.user as any).id);

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

    const cons = await this.consService.update(+id, data, (req.user as any).id);

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

