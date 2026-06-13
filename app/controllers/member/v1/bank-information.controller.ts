import { Request, Response } from "express";
import BankInformationService from "../../../services/member/v1/bank-information.service";
import { successResponse } from "../../../helpers/response";
import { BankInformationCollection } from "../../../resources/member/v1/bank-information/bank-information.collection";
import { BankInformationResource } from "../../../resources/member/v1/bank-information/bank-information.resource";
import { bankInformationScope } from "../../../scopes/member/v1/bank-information.scope";
import prisma from "../../../../prisma/client";
import { formatBankInformationItem } from "../../../helpers/bank-information.helper";

class BankInformationController {
  private bankInformationService: BankInformationService;

  constructor() {
    this.bankInformationService = new BankInformationService();
  }

  async list(req: Request, res: Response) {
    const where = bankInformationScope(req.query);

    const bankInformations = await prisma.bankInformation.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const results = bankInformations.map(formatBankInformationItem);

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count: results.length,
          results,
        },
      },
    });
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = bankInformationScope(req.query);

    if (page && perPage) {
      const bankInformations = await this.bankInformationService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Bank information list successfully",
        BankInformationCollection.withPagination(bankInformations)
      );
    }

    const bankInformations = await this.bankInformationService.findAll(where);

    return successResponse(
      res,
      "Bank information list successfully",
      BankInformationCollection.toCollection(bankInformations)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = bankInformationScope(req.query);
    console.log(where);
    const bankInformations = await this.bankInformationService.findCommonAll(where);
    return successResponse(
      res,
      "Bank information list successfully",
      BankInformationCollection.toCommonCollection(bankInformations)
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
