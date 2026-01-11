import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import { updatePaymentStatusSchema } from "../../../schemas/admin/v1/payment.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { successResponse } from "../../../helpers/response";
import PaymentService from "../../../services/admin/v1/paymet.service";
import { PaymentCollection } from "../../../resources/member/v1/payment/payment.collection";
import { PaymentResource } from "../../../resources/member/v1/payment/payment.resource";
import { Member } from "@prisma/client";

class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
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
            const payments = await this.paymentService.findByPaginate(+page, +perPage, Object.keys(filters).length > 0 ? filters : undefined);
            return successResponse(res, "Payment list successfully", PaymentCollection.withPagination(payments));
        }

        const payments = await this.paymentService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
        return successResponse(res, "Payment list successfully", PaymentCollection.toCollection(payments));
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;
        const payment = await this.paymentService.findOne(+id);
        return successResponse(res, "Payment details successfully", PaymentResource.toResource(payment));
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;

        const { data, error, success } = await validater(
            updatePaymentStatusSchema,
            req.body
        );

        if (!success) {
            throw new ValidationException("Failed to update payment status", error);
        }

        const payment = await this.paymentService.update(+id, data, (req.user as Member).id);
        return successResponse(res, "Payment status updated successfully", PaymentResource.toResource(payment));
    }
}

export default PaymentController;
