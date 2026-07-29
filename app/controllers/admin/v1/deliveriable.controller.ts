import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createDeliveriableSchema,
  updateDeliveriableSchema,
} from "../../../schemas/admin/v1/deliveriable.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { deliveriableScope } from "../../../scopes/admin/v1/deliveriable.scope";
import DeliveriableService from "../../../services/admin/v1/deliveriable.service";

class DeliveriableController {
  private deliveriableService: DeliveriableService;

  constructor() {
    this.deliveriableService = new DeliveriableService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    const where = deliveriableScope(req.query);

    if (page && perPage) {
      const deliveriables = await this.deliveriableService.findByPaginate(
        +page,
        +perPage,
        where,
      );
      return successResponse(
        res,
        "Deliveriable list successfully",
        deliveriables,
      );
    }

    const deliveriables = await this.deliveriableService.findAll(where);
    return successResponse(
      res,
      "Deliveriable list successfully",
      deliveriables,
    );
  }

  async findOne(req: Request, res: Response) {
    const deliveriable = await this.deliveriableService.findOne(+req.params.id);
    return successResponse(
      res,
      "Deliveriable detail successfully",
      deliveriable,
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createDeliveriableSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Deliveriable created failed", error);
    }

    const deliveriable = await this.deliveriableService.create(data);
    return successResponse(
      res,
      "Deliveriable created successfully",
      deliveriable,
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateDeliveriableSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Deliveriable updated failed", error);
    }

    const deliveriable = await this.deliveriableService.update(
      +req.params.id,
      data,
    );
    return successResponse(
      res,
      "Deliveriable updated successfully",
      deliveriable,
    );
  }

  async destroy(req: Request, res: Response) {
    await this.deliveriableService.destroy(+req.params.id);
    return successResponse(res, "Deliveriable deleted successfully");
  }
}

export default DeliveriableController;
