import { Request, Response } from "express";
import BodyAttentionAreaService from "../../../services/admin/v1/body-attention-area.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createBodyAttentionAreaSchema,
  updateBodyAttentionAreaSchema,
} from "../../../schemas/admin/v1/body-attention-area.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { BodyAttentionAreaCollection } from "../../../resources/admin/v1/body-attention-area/body-attention-area.collection";
import { BodyAttentionAreaResource } from "../../../resources/admin/v1/body-attention-area/body-attention-area.resource";

class BodyAttentionAreaController {
  private bodyAttentionAreaService: BodyAttentionAreaService;

  constructor() {
    this.bodyAttentionAreaService = new BodyAttentionAreaService();
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
      const bodyAttentionAreas = await this.bodyAttentionAreaService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Body attention area list successfully",
        BodyAttentionAreaCollection.withPagination(bodyAttentionAreas)
      );
    }

    const bodyAttentionAreas = await this.bodyAttentionAreaService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Body attention area list successfully",
      BodyAttentionAreaCollection.toCollection(bodyAttentionAreas)
    );
  }

  async findOne(req: Request, res: Response) {
    const bodyAttentionArea = await this.bodyAttentionAreaService.findOne(
      +req.params.id
    );
    return successResponse(
      res,
      "Body attention area details successfully",
      BodyAttentionAreaResource.toResource(bodyAttentionArea)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(
      createBodyAttentionAreaSchema,
      req.body
    );

    if (error) {
      throw new ValidationException("Failed to create body attention area", error);
    }

    const userId = (req.user as any)?.id;
    const bodyAttentionArea = await this.bodyAttentionAreaService.create(
      data,
      userId
    );
    return successResponse(
      res,
      "Body attention area created successfully",
      BodyAttentionAreaResource.toResource(bodyAttentionArea)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(
      updateBodyAttentionAreaSchema,
      req.body
    );

    if (error) {
      throw new ValidationException("Failed to update body attention area", error);
    }

    const userId = (req.user as any)?.id;
    const bodyAttentionArea = await this.bodyAttentionAreaService.update(
      +req.params.id,
      data,
      userId
    );
    return successResponse(
      res,
      "Body attention area updated successfully",
      BodyAttentionAreaResource.toResource(bodyAttentionArea)
    );
  }

  async destroy(req: Request, res: Response) {
    const bodyAttentionArea = await this.bodyAttentionAreaService.destroy(
      +req.params.id
    );
    return successResponse(
      res,
      "Body attention area deleted successfully",
      BodyAttentionAreaResource.toResource(bodyAttentionArea)
    );
  }
}

export default BodyAttentionAreaController;

