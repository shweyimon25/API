import { Request, Response } from "express";
import PaymentService from "../../../services/member/v1/payment.service";
import { createPaymentSchema } from "../../../schemas/member/v1/payment.schema";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { successResponse } from "../../../helpers/response";
import { PaymentResource } from "../../../resources/member/v1/payment/payment.resource";

class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    async create(req: Request, res: Response) {
        const { data, error, success } = await validater(
            createPaymentSchema,
            req.body
        );

        if (!success) {
            throw new ValidationException("Failed to create payment", error);
        }

        const memberId = (req.user as any)?.id;
        const files = req.files as Express.Multer.File[];
        const payment = await this.paymentService.create(data, memberId, files);

        return successResponse(res, "Payment created successfully", PaymentResource.toResource(payment));
    }
}

export default PaymentController;