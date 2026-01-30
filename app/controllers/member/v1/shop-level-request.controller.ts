import { Request, Response } from "express";
import { shopLevelRequestSchema } from "../../../schemas/member/v1/shop-level-request.schema";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import ShopLevelRequestService from "../../../services/member/v1/shop-level-request.service";
import { Member } from "@prisma/client";
import { successResponse } from "../../../helpers/response";

class ShopLevelRequestController {
    private shopLevelRequestService: ShopLevelRequestService;

    constructor() {
        this.shopLevelRequestService = new ShopLevelRequestService();
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(shopLevelRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Shop level request failed", error);
        }

        const shopLevelRequest = await this.shopLevelRequestService.shopLevelRequest(data, (req.user as Member).id);
        return successResponse(res, "Shop level request created successfully", shopLevelRequest);
    }
}

export default ShopLevelRequestController;