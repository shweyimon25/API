import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import TypeService from "../../../services/admin/v1/type.service";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import {
  createTypeSchema,
  updateTypeSchema,
} from "../../../schemas/admin/v1/type.schema";
import { TypeResource } from "../../../resources/admin/v1/type/type.resource";
import { TypeCollection } from "../../../resources/admin/v1/type/type.collection";

class TypeController {
  private typeService: TypeService;

  constructor() {
    this.typeService = new TypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const floors = await this.typeService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Type list successfully",
        TypeCollection.withPagination(floors)
      );
    }

    const floors = await this.typeService.findAll();
    return successResponse(
      res,
      "Type list successfully",
      TypeCollection.toCollection(floors)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const type = await this.typeService.findOne(+id);
    return successResponse(
      res,
      "Type detail successfully",
      TypeResource.toResource(type)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createTypeSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Type created failed", error);
    }

    const type = await this.typeService.create(data);
    return successResponse(
      res,
      "Type created successfully",
      TypeResource.toResource(type)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingType = await prisma.type.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingType) {
        throw new ValidationException("Type updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateTypeSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Type updated failed", error);
    }

    const type = await this.typeService.update(+id, data);
    return successResponse(
      res,
      "Type updated successfully",
      TypeResource.toResource(type)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.typeService.destroy(+id);
    return successResponse(res, "Type deleted successfully");
  }
}

export default TypeController;
