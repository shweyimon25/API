import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import TableTypeService from "../../../services/admin/v1/table-type.service";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { TableTypeCollection } from "../../../resources/admin/v1/table-type/table-type.collection";
import { TableTypeResource } from "../../../resources/admin/v1/table-type/table-type.resource";
import { createTableTypeSchema, updateTableTypeSchema } from "../../../schemas/admin/v1/table-type.schema";

class TableTypeController {
  private tableTypeService: TableTypeService;

  constructor() {
    this.tableTypeService = new TableTypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const floors = await this.tableTypeService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Table type list successfully",
        TableTypeCollection.withPagination(floors)
      );
    }

    const floors = await this.tableTypeService.findAll();
    return successResponse(
      res,
      "Table type list successfully",
      TableTypeCollection.toCollection(floors)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const type = await this.tableTypeService.findOne(+id);
    return successResponse(
      res,
      "Table type detail successfully",
      TableTypeResource.toResource(type)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createTableTypeSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Type created failed", error);
    }

    const type = await this.tableTypeService.create(data);
    return successResponse(
      res,
      "Table type created successfully",
      TableTypeResource.toResource(type)
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
      updateTableTypeSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Type updated failed", error);
    }

    const type = await this.tableTypeService.update(+id, data);
    return successResponse(
      res,
      "Table type updated successfully",
      TableTypeResource.toResource(type)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.tableTypeService.destroy(+id);
    return successResponse(res, "Table type deleted successfully");
  }
}

export default TableTypeController;
