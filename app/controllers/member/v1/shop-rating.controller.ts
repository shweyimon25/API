import { Request, Response } from "express";
import ShopRatingService from "../../../services/member/v1/shop-rating.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { BadRequestException, ValidationException } from "../../../helpers/exceptions";
import { createShopRatingSchema, updateShopRatingSchema } from "../../../schemas/member/v1/shop-rating.schema";
import { Member } from "@prisma/client";

class ShopRatingController {
    private shopRatingService: ShopRatingService;

    constructor() {
        this.shopRatingService = new ShopRatingService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage, shopId } = req.query;

        if (!shopId) {
            throw new BadRequestException("Shop ID is required");
        }

        if (page && perPage) {
            const shopRatings = await this.shopRatingService.findByPaginate(+page, +perPage, +shopId);
            return successResponse(res, "Shop ratings fetched successfully", shopRatings);
        }

        const shopRatings = await this.shopRatingService.findAll(+shopId);
        return successResponse(res, "Shop ratings fetched successfully", shopRatings);
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createShopRatingSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to create shop rating", error);
        }

        const memberId = (req.user as Member).id;
        const shopRating = await this.shopRatingService.create(data, memberId);
        return successResponse(res, "Shop rating created successfully", shopRating);
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;

        const { data, success, error } = await validater(updateShopRatingSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update shop rating", error);
        }

        const memberId = (req.user as Member).id;
        const shopRating = await this.shopRatingService.update(+id, data, memberId);
        return successResponse(res, "Shop rating updated successfully", shopRating);
    }

    async destroy(req: Request, res: Response) {
        const { id } = req.params;
        const memberId = (req.user as Member).id;

        const shopRating = await this.shopRatingService.destroy(+id, memberId);
        return successResponse(res, "Shop rating deleted successfully", shopRating);
    }
}

export default ShopRatingController;
