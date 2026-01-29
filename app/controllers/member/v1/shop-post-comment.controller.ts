import { Request, Response } from "express";
import { Member } from "@prisma/client";
import ShopPostCommentService from "../../../services/member/v1/shop-post-comment.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { createShopPostCommentSchema, updateShopPostCommentSchema } from "../../../schemas/member/v1/shop-post-comment.schema";
import { ShopPostCommentResource } from "../../../resources/member/v1/shop-post-comment/shop-post-comment.resource";

class ShopPostCommentController {
    private shopPostCommentService: ShopPostCommentService;

    constructor() {
        this.shopPostCommentService = new ShopPostCommentService();
    }

    async findAll(req: Request, res: Response) {
        const { shopPostId } = req.query;
        if (shopPostId == null || shopPostId === "") {
            throw new ValidationException("Failed to list shop post comments", [
                { field: "shopPostId", issue: "Shop post ID is required" },
            ]);
        }
        const comments = await this.shopPostCommentService.listByShopPostId(+shopPostId);
        return successResponse(res, "Shop post comments list successfully", comments);
    }

    async findOne(req: Request, res: Response) {
        const comment = await this.shopPostCommentService.findOne(+req.params.id);
        return successResponse(
            res,
            "Shop post comment fetched successfully",
            ShopPostCommentResource.toResource(comment)
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createShopPostCommentSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to create shop post comment", error);
        }
        const memberId = (req.user as Member).id;
        const comment = await this.shopPostCommentService.give(data, memberId);
        return successResponse(
            res,
            "Shop post comment created successfully",
            ShopPostCommentResource.toResource(comment)
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateShopPostCommentSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to update shop post comment", error);
        }
        const memberId = (req.user as Member).id;
        const comment = await this.shopPostCommentService.update(+req.params.id, data, memberId);
        return successResponse(
            res,
            "Shop post comment updated successfully",
            ShopPostCommentResource.toResource(comment)
        );
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        await this.shopPostCommentService.destroy(+req.params.id, memberId);
        return successResponse(res, "Shop post comment deleted successfully");
    }
}

export default ShopPostCommentController;
