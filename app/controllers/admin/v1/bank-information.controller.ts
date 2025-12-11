import { Request, Response } from "express";
import BankInformationService from "../../../services/admin/v1/bank-information.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createBankInformationSchema,
  updateBankInformationSchema,
} from "../../../schemas/admin/v1/bank-information.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { BankInformationCollection } from "../../../resources/admin/v1/bank-information/bank-information.collection";
import { BankInformationResource } from "../../../resources/admin/v1/bank-information/bank-information.resource";

class BankInformationController {
  private bankInformationService: BankInformationService;

  constructor() {
    this.bankInformationService = new BankInformationService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const bankInformations =
        await this.bankInformationService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Bank information list successfully",
        BankInformationCollection.withPagination(bankInformations)
      );
    }

    const bankInformations = await this.bankInformationService.findAll();
    return successResponse(
      res,
      "Bank information list successfully",
      BankInformationCollection.toCollection(bankInformations)
    );
  }

  async findOne(req: Request, res: Response) {
    const bankInformation = await this.bankInformationService.findOne(
      +req.params.id
    );
    return successResponse(
      res,
      "Bank information details successfully",
      BankInformationResource.toResource(bankInformation)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(
      createBankInformationSchema,
      req.body
    );

    if (error) {
      throw new ValidationException("Failed to create bank information", error);
    }

    const userId = (req.user as any)?.id;
    const bankInformation = await this.bankInformationService.create(
      data,
      userId
    );
    return successResponse(
      res,
      "Bank information created successfully",
      BankInformationResource.toResource(bankInformation)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(
      updateBankInformationSchema,
      req.body
    );

    if (error) {
      throw new ValidationException("Failed to update bank information", error);
    }

    const userId = (req.user as any)?.id;
    const bankInformation = await this.bankInformationService.update(
      +req.params.id,
      data,
      userId
    );
    return successResponse(
      res,
      "Bank information updated successfully",
      BankInformationResource.toResource(bankInformation)
    );
  }

  async destroy(req: Request, res: Response) {
    const bankInformation = await this.bankInformationService.destroy(
      +req.params.id
    );
    return successResponse(
      res,
      "Bank information deleted successfully",
      BankInformationResource.toResource(bankInformation)
    );
  }
}

export default BankInformationController;
