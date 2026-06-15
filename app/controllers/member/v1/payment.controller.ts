import { Member } from "@prisma/client";
import { Request, Response } from "express";
import PaymentService, {
  RpcPaymentParams,
} from "../../../services/member/v1/payment.service";
import { createPaymentSchema } from "../../../schemas/member/v1/payment.schema";
import { validater } from "../../../helpers/validator";
import {
  ValidationException,
  Exception,
} from "../../../helpers/exceptions";
import { successResponse } from "../../../helpers/response";
import { PaymentResource } from "../../../resources/member/v1/payment/payment.resource";
import { formatPaymentReference } from "../../../helpers/payment.helper";

class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  private rpcError(res: Response, message: string) {
    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: false,
        message,
        data: null,
      },
    });
  }

  async createRpc(req: Request, res: Response) {
    const params = (req.body?.params ?? {}) as RpcPaymentParams;
    const memberId = (req.user as Member).id;

    try {
      const payment = await this.paymentService.createFromRpcParams(
        params,
        memberId
      );

      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: true,
          data: {
            id: payment.id,
            name: formatPaymentReference(payment.id),
          },
        },
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        const message =
          error.details?.[0]?.issue ?? error.message ?? "Validation failed";
        return this.rpcError(res, message);
      }

      if (error instanceof Exception) {
        return this.rpcError(res, error.message);
      }

      console.error("Create payment error:", error);
      return this.rpcError(res, "Internal server error");
    }
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createPaymentSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Failed to create payment", error);
    }

    const memberId = (req.user as Member).id;
    const files = req.files as Express.Multer.File[];
    const payment = await this.paymentService.create(data, memberId, files);

    return successResponse(
      res,
      "Payment created successfully",
      PaymentResource.toResource(payment)
    );
  }
}

export default PaymentController;
