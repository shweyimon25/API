import { MemberRequestStatus, Prisma, User } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import { Request, Response } from "express";
import { ShopLevelRequestCollection } from "../../../resources/admin/v1/shop-level-request/shop-level-request.collection";
import { ShopLevelRequestResource } from "../../../resources/admin/v1/shop-level-request/shop-level-request.resource";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { updateShopLevelRequestSchema } from "../../../schemas/admin/v1/shop-level-request.schema";
import ShopLevelRequestService from "../../../services/admin/v1/shop-level-request.service";
import { shopLevelRequestScope } from "../../../scopes/admin/v1/shop-level-request.scope";

class ShopLevelRequestController {
    private shopLevelRequestService: ShopLevelRequestService;

    constructor() {
        this.shopLevelRequestService = new ShopLevelRequestService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage} = req.query;

        const where = shopLevelRequestScope(req.query);

        if (page && perPage) {
            const shopUpgradeRequests = await this.shopLevelRequestService.findByPaginate(
                +page,
                +perPage,
                where
            );
            return successResponse(
                res,
                "Shop level request list successfully",
                ShopLevelRequestCollection.withPagination(shopUpgradeRequests)
            );
        }

        const shopUpgradeRequests = await this.shopLevelRequestService.findAll(where);

        return successResponse(
            res,
            "Shop level request list successfully",
            ShopLevelRequestCollection.toCollection(shopUpgradeRequests)
        );
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { data, error, success } = await validater(updateShopLevelRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update shop level request", error);
        }

        const shopUpgradeRequest = await this.shopLevelRequestService.update(+id, data, (req.user as User).id);

        return successResponse(
            res,
            `Shop level request ${data.status === MemberRequestStatus.APPROVED ? "approved" : "rejected"} successfully`,
            ShopLevelRequestResource.toResource(shopUpgradeRequest)
        );
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;
        const shopUpgradeRequest = await this.shopLevelRequestService.findOne(+id);
        return successResponse(
            res,
            "Shop level request detail successfully",
            ShopLevelRequestResource.toResource(shopUpgradeRequest)
        );
    }
}

export default ShopLevelRequestController;
