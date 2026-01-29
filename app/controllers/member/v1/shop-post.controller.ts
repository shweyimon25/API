import { Request, Response } from "express";
import { Member } from "@prisma/client";
import ShopPostService from "../../../services/member/v1/shop-post.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { createShopPostSchema, updateShopPostSchema } from "../../../schemas/member/v1/shop-post.schema";
import { ShopPostCollection } from "../../../resources/member/v1/shop-post/shop-post.collection";
import { ShopPostResource } from "../../../resources/member/v1/shop-post/shop-post.resource";

class ShopPostController {
    private shopPostService: ShopPostService;

    constructor() {
        this.shopPostService = new ShopPostService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        if (page && perPage) {
            const shopPosts = await this.shopPostService.findByPaginate(+page, +perPage);
            return successResponse(
                res,
                "Shop posts fetched successfully",
                ShopPostCollection.withPagination(shopPosts)
            );
        }

        const shopPosts = await this.shopPostService.findAll();
        return successResponse(
            res,
            "Shop posts fetched successfully",
            ShopPostCollection.toCollection(shopPosts)
        );
    }

    async findOne(req: Request, res: Response) {
        const shopPost = await this.shopPostService.findOne(+req.params.id);
        return successResponse(
            res,
            "Shop post fetched successfully",
            ShopPostResource.toResource(shopPost)
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createShopPostSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to create shop post", error);
        }

        const memberId = (req.user as Member).id;
        const shopPost = await this.shopPostService.create(data, memberId);
        return successResponse(
            res,
            "Shop post created successfully",
            ShopPostResource.toResource(shopPost)
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateShopPostSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to update shop post", error);
        }

        const memberId = (req.user as Member).id;
        const shopPost = await this.shopPostService.update(+req.params.id, data, memberId);
        return successResponse(
            res,
            "Shop post updated successfully",
            ShopPostResource.toResource(shopPost)
        );
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        await this.shopPostService.destroy(+req.params.id, memberId);
        return successResponse(res, "Shop post deleted successfully");
    }
}

export default ShopPostController;
