import { ProficientLevelResource } from "./../../../resources/admin/v1/proficient-level/proficient-level.resource";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import ProficientLevelService from "../../../services/admin/v1/proficient-level.service";
import { ProficientLevelCollection } from "../../../resources/admin/v1/proficient-level/proficient-level.collection";
import {
  createProficientLevelSchema,
  updateProficientLevelSchema,
} from "../../../schemas/admin/v1/proficient-level.schema";
import { Prisma, Status } from "@prisma/client";

class ProficientLevelController {
  private proficientLevelService: ProficientLevelService;

  constructor() {
    this.proficientLevelService = new ProficientLevelService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name, status } = req.query;

    let where: Prisma.ProficientLevelWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    if (status) {
      where.status = status as Status;
    }

    if (page && perPage) {
      const proficientLevels = await this.proficientLevelService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Proficient level successfully",
        ProficientLevelCollection.withPagination(proficientLevels)
      );
    }

    const porficientLevel = await this.proficientLevelService.findAll(where);
    return successResponse(
      res,
      "Proficient level successfully",
      ProficientLevelCollection.toCollection(porficientLevel)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { name } = req.query;

    let where: Prisma.ProficientLevelWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    const proficientLevels = await this.proficientLevelService.findCommonAll(where);
    
    return successResponse(
      res,
      "Proficient level list successfully",
      ProficientLevelCollection.toCommonCollection(proficientLevels)
    );
  }

  async findOne(req: Request, res: Response) {
    const proficientLevel = await this.proficientLevelService.findOne(
      +req.params.id
    );

    return successResponse(
      res,
      "Proficient level detail successfully",
      ProficientLevelResource.toResource(proficientLevel)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createProficientLevelSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Proficient level created failed", error);
    }

    const proficientLevel = await this.proficientLevelService.create(data);

    return successResponse(
      res,
      "Proficient level created successfully",
      ProficientLevelResource.toResource(proficientLevel)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateProficientLevelSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Proficient level updated failed", error);
    }

    const proficientLevel = await this.proficientLevelService.update(
      +req.params.id,
      data
    );

    return successResponse(
      res,
      "Proficient level updated successfully",
      ProficientLevelResource.toResource(proficientLevel)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.proficientLevelService.destroy(+req);
    return successResponse(res, "Proficient level deleted successfully");
  }
}

export default ProficientLevelController;
