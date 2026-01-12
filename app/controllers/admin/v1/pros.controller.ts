import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import ProsService from "../../../services/admin/v1/pros.service";
import { validater } from "../../../helpers/validator";
import {
  createProsSchema,
  updateProsSchema,
} from "../../../schemas/admin/v1/pros.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { ProsCollection } from "../../../resources/admin/v1/pros/pros.collection";
import { ProsResource } from "../../../resources/admin/v1/pros/pros.resource";
import { Prisma, Status } from "@prisma/client";

class ProsController {
  private prosService: ProsService;

  constructor() {
    this.prosService = new ProsService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name, guard, status } = req.query;

    let where: Prisma.ProsWhereInput = {};

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
      const pros = await this.prosService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Pros list successfully",
        ProsCollection.withPagination(pros)
      );
    }

    const pros = await this.prosService.findAll(where);

    return successResponse(
      res,
      "Pros list successfully",
      ProsCollection.toCollection(pros)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { name, guard } = req.query;

    let where: Prisma.ProsWhereInput = {};

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

    const pros = await this.prosService.findCommonAll(where);

    return successResponse(
      res,
      "Common Pros list successfully",
      ProsCollection.toCommonCollection(pros)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const pros = await this.prosService.findOne(+id);
    return successResponse(
      res,
      "Pros detail successfully",
      ProsResource.toResource(pros)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createProsSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Pros created failed", error);
    }

    const pros = await this.prosService.create(data, (req.user as any).id);

    return successResponse(
      res,
      "Pros created successfully",
      ProsResource.toResource(pros)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { data, error, success } = await validater(
      updateProsSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Pros updated failed", error);
    }

    const pros = await this.prosService.update(+id, data, (req.user as any).id);

    return successResponse(
      res,
      "Pros updated successfully",
      ProsResource.toResource(pros)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.prosService.destroy(+id);
    return successResponse(res, "Pros deleted successfully");
  }
}

export default ProsController;

