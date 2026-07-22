import { Member } from "@prisma/client";
import { Request, Response } from "express";
import PaymentService from "../../../services/member/v1/payment.service";
import {
  ValidationException,
  Exception,
} from "../../../helpers/exceptions";
import {
  formatPaymentReference,
  parsePaymentRpcBody,
} from "../../../helpers/payment.helper";

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

  async createPayment(req: Request, res: Response) {
    const params = parsePaymentRpcBody(req.body as Record<string, unknown>);
    const files = (req.files as Express.Multer.File[]) ?? [];
    const memberId = (req.user as Member).id;

    try {
      const payment = await this.paymentService.createFromRpcParams(
        params,
        memberId,
        files
      );

      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: true,
          data: {
            id: payment.id,
            name: formatPaymentReference(payment.id),
            photo: payment.attachment,
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

}

export default PaymentController;
