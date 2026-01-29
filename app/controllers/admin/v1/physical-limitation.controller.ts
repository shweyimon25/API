import { Request, Response } from "express";
import PhysicalLimitationService from "../../../services/admin/v1/physical-limitation.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createPhysicalLimitationSchema,
  updatePhysicalLimitationSchema,
} from "../../../schemas/admin/v1/physical-limitation.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { PhysicalLimitationCollection } from "../../../resources/admin/v1/physical-limitation/physical-limitation.collection";
import { PhysicalLimitationResource } from "../../../resources/admin/v1/physical-limitation/physical-limitation.resource";
import { User } from "@prisma/client";
import { physicalLimitationScope } from "../../../scopes/admin/v1/physical-limitation.scope";

class PhysicalLimitationController {
  private physicalLimitationService: PhysicalLimitationService;

  constructor() {
    this.physicalLimitationService = new PhysicalLimitationService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = physicalLimitationScope(req.query);

    if (page && perPage) {
      const physicalLimitations = await this.physicalLimitationService.findByPaginate(+page, +perPage, where);

      return successResponse(
        res,
        "Physical limitation list successfully",
        PhysicalLimitationCollection.withPagination(physicalLimitations)
      );
    }

    const physicalLimitations = await this.physicalLimitationService.findAll(where);

    return successResponse(
      res,
      "Physical limitation list successfully",
      PhysicalLimitationCollection.toCollection(physicalLimitations)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = physicalLimitationScope(req.query);

    const physicalLimitations = await this.physicalLimitationService.findCommonAll(where);

    return successResponse(
      res,
      "Physical limitation list successfully",
      PhysicalLimitationCollection.toCommonCollection(physicalLimitations)
    );
  }

  async findOne(req: Request, res: Response) {
    const physicalLimitation = await this.physicalLimitationService.findOne(
      +req.params.id
    );
    return successResponse(
      res,
      "Physical limitation details successfully",
      PhysicalLimitationResource.toResource(physicalLimitation)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(
      createPhysicalLimitationSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException(
        "Failed to create physical limitation",
        error
      );
    }

    const physicalLimitation = await this.physicalLimitationService.create(
      data,
      (req.user as User).id,
      req.files as Express.Multer.File[]
    );

    return successResponse(
      res,
      "Physical limitation created successfully",
      PhysicalLimitationResource.toResource(physicalLimitation)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(
      updatePhysicalLimitationSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException(
        "Failed to update physical limitation",
        error
      );
    }

    const physicalLimitation = await this.physicalLimitationService.update(
      +req.params.id,
      data,
      (req.user as User).id,
      req.files as Express.Multer.File[]
    );

    return successResponse(
      res,
      "Physical limitation updated successfully",
      PhysicalLimitationResource.toResource(physicalLimitation)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.physicalLimitationService.destroy(+req.params.id);
    return successResponse(res, "Physical limitation deleted successfully");
  }
}

export default PhysicalLimitationController;
