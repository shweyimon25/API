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

class PhysicalLimitationController {
  private physicalLimitationService: PhysicalLimitationService;

  constructor() {
    this.physicalLimitationService = new PhysicalLimitationService();
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
      const physicalLimitations =
        await this.physicalLimitationService.findByPaginate(
          +page,
          +perPage,
          Object.keys(filters).length > 0 ? filters : undefined
        );
      return successResponse(
        res,
        "Physical limitation list successfully",
        PhysicalLimitationCollection.withPagination(physicalLimitations)
      );
    }

    const physicalLimitations = await this.physicalLimitationService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Physical limitation list successfully",
      PhysicalLimitationCollection.toCollection(physicalLimitations)
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
    const { data, error } = await validater(
      createPhysicalLimitationSchema,
      req.body
    );

    if (error) {
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
    const { data, error } = await validater(
      updatePhysicalLimitationSchema,
      req.body
    );

    if (error) {
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
    const physicalLimitation = await this.physicalLimitationService.destroy(
      +req.params.id
    );
    return successResponse(
      res,
      "Physical limitation deleted successfully",
      PhysicalLimitationResource.toResource(physicalLimitation)
    );
  }
}

export default PhysicalLimitationController;
