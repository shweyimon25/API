import { Request, Response } from "express";
import { Member } from "@prisma/client";
import ShopPostReactionService from "../../../services/member/v1/shop-post-reaction.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { BadRequestException, ValidationException } from "../../../helpers/exceptions";
import { createShopPostReactionSchema } from "../../../schemas/member/v1/shop-post-reaction.schema";
import { ShopPostReactionResource } from "../../../resources/member/v1/shop-post-reaction/shop-post-reaction.resource";

class ShopPostReactionController {
    private shopPostReactionService: ShopPostReactionService;

    constructor() {
        this.shopPostReactionService = new ShopPostReactionService();
    }

    async findAll(req: Request, res: Response) {
        const { shopPostId } = req.query;

        if (!shopPostId) {
            throw new BadRequestException("Shop post id query parameter is required");
        }

        const reactions = await this.shopPostReactionService.findAll(+shopPostId);
        return successResponse(res, "Shop post reactions retrieved successfully", reactions.map(ShopPostReactionResource.toResource));
    }

    async findOne(req: Request, res: Response) {
        const reaction = await this.shopPostReactionService.findOne(+req.params.id);
        return successResponse(res, "Shop post reaction retrieved successfully", ShopPostReactionResource.toResource(reaction));
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createShopPostReactionSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to toggle shop post reaction", error);
        }
        const memberId = (req.user as Member).id;
        const reaction = await this.shopPostReactionService.give(data, memberId);
        if (reaction) {
            return successResponse(res, "Shop post reaction added successfully", ShopPostReactionResource.toResource(reaction));
        }
        return successResponse(res, "Shop post reaction removed successfully");
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        await this.shopPostReactionService.destroy(+req.params.id, memberId);
        return successResponse(res, "Shop post reaction deleted successfully");
    }
}

export default ShopPostReactionController;
