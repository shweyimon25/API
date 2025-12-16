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

class ProsController {
  private prosService: ProsService;

  constructor() {
    this.prosService = new ProsService();
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
      const pros = await this.prosService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Pros list successfully",
        ProsCollection.withPagination(pros)
      );
    }

    const pros = await this.prosService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return successResponse(
      res,
      "Pros list successfully",
      ProsCollection.toCollection(pros)
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

    const pros = await this.prosService.create(data);

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

    const pros = await this.prosService.update(+id, data);

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

