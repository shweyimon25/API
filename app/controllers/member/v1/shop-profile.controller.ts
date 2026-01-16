import { successResponse } from "../../../helpers/response";
import { Request, Response } from "express";
import ShopProfileService from "../../../services/member/v1/shop-profile.service";
import { Member } from "@prisma/client";
import { validater } from "../../../helpers/validator";
import { updateShopProfileSchema, upgradeShopProfileSchema } from "../../../schemas/member/v1/shop-profile.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { ShopProfileResource } from "../../../resources/member/v1/shop-profile/shop-profile.resource";

class ShopProfileController {
    private shopProfileService: ShopProfileService;

    constructor() {
        this.shopProfileService = new ShopProfileService();
    }

    async profile(req: Request, res: Response) {
        const memberId = (req.user as Member).id
        const shop = await this.shopProfileService.profile(memberId);
        return successResponse(res, "Shop profile fetched successfully", ShopProfileResource.toResource(shop));
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateShopProfileSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to updated shop profile", error);
        }

        const memberId = (req.user as Member).id;
        const files = req.files as Express.Multer.File[];
        const shop = await this.shopProfileService.update(memberId, data, files);

        return successResponse(res, "Shop profile updated successfully", ShopProfileResource.toResource(shop));
    }

    async upgrade(req: Request, res: Response) {
        const { data, success, error } = await validater(upgradeShopProfileSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to upgrade shop profile", error);
        }

        const memberId = (req.user as Member).id;
        const shop = await this.shopProfileService.upgrade(memberId, data);

        return successResponse(res, "Shop upgraded requested successfully", shop);
    }
}

export default ShopProfileController;