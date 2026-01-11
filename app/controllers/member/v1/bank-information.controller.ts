import { Request, Response } from "express";
import BankInformationService from "../../../services/member/v1/bank-information.service";
import { successResponse } from "../../../helpers/response";
import { BankInformationCollection } from "../../../resources/member/v1/bank-information/bank-information.collection";
import { BankInformationResource } from "../../../resources/member/v1/bank-information/bank-information.resource";

class BankInformationController {
  private bankInformationService: BankInformationService;

  constructor() {
    this.bankInformationService = new BankInformationService();
  }

  async findAll(req: Request, res: Response) {
    const { paymentTypes, search } = req.query;

    const filters: any = {};
    if (paymentTypes) {
      filters.paymentTypes = paymentTypes as string;
    }
    if (search) {
      filters.search = search as string;
    }

    const bankInformations = await this.bankInformationService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );

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
}

export default BankInformationController;
