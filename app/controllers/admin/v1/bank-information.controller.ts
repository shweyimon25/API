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
import { PaymentTypes, Prisma, Status } from "@prisma/client";

class BankInformationController {
  private bankInformationService: BankInformationService;

  constructor() {
    this.bankInformationService = new BankInformationService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, search, bankAccountHolder, bankAccountNumber, phone, paymentTypes, status } = req.query;

    let where: Prisma.BankInformationWhereInput = {};

    if (search) {
      where.OR = [{
        bankAccountHolder: {
          contains: search as string,
          mode: "insensitive",
        },
        bankAccountNumber: {
          contains: search as string,
          mode: "insensitive",
        },
        phone: {
          contains: search as string,
          mode: "insensitive",
        },
      }];
    }

    if (bankAccountHolder || bankAccountNumber || phone) {
      where.OR = [];
      if (bankAccountHolder) {
        where.OR.push({
          bankAccountHolder: {
            contains: bankAccountHolder as string,
          },
        });
      }
      if (bankAccountNumber) {
        where.OR.push({
          bankAccountNumber: {
            contains: bankAccountNumber as string,
          },
        });
      }
      if (phone) {
        where.OR.push({
          phone: {
            contains: phone as string,
          },
        });
      }
    }

    if (paymentTypes) {
      where.paymentTypes = paymentTypes as PaymentTypes;
    }

    if (status) {
      where.status = status as Status;
    }

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
    const { bankAccountHolder } = req.query;

    let where: Prisma.BankInformationWhereInput = {};

    if (bankAccountHolder) {
      where.bankAccountHolder = {
        contains: bankAccountHolder as string,
      };
    }

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

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(
      createBankInformationSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Failed to create bank information", error);
    }

    const userId = (req.user as any)?.id;
    const bankInformation = await this.bankInformationService.create(
      data,
      userId,
      req.files as Express.Multer.File[]
    );

    return successResponse(
      res,
      "Bank information created successfully",
      BankInformationResource.toResource(bankInformation)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(
      updateBankInformationSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Failed to update bank information", error);
    }

    const userId = (req.user as any)?.id;
    const bankInformation = await this.bankInformationService.update(
      +req.params.id,
      data,
      userId,
      req.files as Express.Multer.File[]
    );

    return successResponse(
      res,
      "Bank information updated successfully",
      BankInformationResource.toResource(bankInformation)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.bankInformationService.destroy(+req.params.id);
    return successResponse(res, "Bank information deleted successfully");
  }
}

export default BankInformationController;
