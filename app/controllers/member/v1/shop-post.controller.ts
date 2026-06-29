import { Request, Response } from "express";
import { Member } from "@prisma/client";
import ShopPostService from "../../../services/member/v1/shop-post.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { createShopPostSchema, updateShopPostSchema } from "../../../schemas/member/v1/shop-post.schema";
import { ShopPostCollection } from "../../../resources/member/v1/shop-post/shop-post.collection";
import { ShopPostResource } from "../../../resources/member/v1/shop-post/shop-post.resource";
import { memberShopPostScope } from "../../../scopes/member/v1/shop-post.scope";
import prisma from "../../../../prisma/client";
import {
    buildMemberShopPostWhere,
    formatMemberShopPostWithShare,
    memberShopPostInclude,
    parseMemberShopPostOrder,
} from "../../../helpers/member-shop-post.helper";

class ShopPostController {
    private shopPostService: ShopPostService;

    constructor() {
        this.shopPostService = new ShopPostService();
    }

    async memberShopPosts(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const params = req.body?.params ?? {};
        const offset = Number(params.offset ?? 0);
        const limit = Number(params.limit ?? 0);
        const where = buildMemberShopPostWhere(params.filters);
        const orderBy = parseMemberShopPostOrder(params.order);
        const include = memberShopPostInclude(memberId);

        const [count, posts] = await Promise.all([
            prisma.post.count({ where }),
            prisma.post.findMany({
                where,
                orderBy,
                ...(Number.isFinite(offset) && offset > 0 ? { skip: offset } : {}),
                ...(Number.isFinite(limit) && limit > 0 ? { take: limit } : {}),
                include,
            }),
        ]);

        const results = await Promise.all(
            posts.map((post) =>
                formatMemberShopPostWithShare(post, memberId)
            )
        );

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data: {
                    count,
                    results,
                },
            },
        });
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;
        const where = memberShopPostScope(req.query);

        if (page && perPage) {
            const shopPosts = await this.shopPostService.findByPaginate(+page, +perPage, where);
            return successResponse(
                res,
                "Shop posts fetched successfully",
                ShopPostCollection.withPagination(shopPosts)
            );
        }

        const shopPosts = await this.shopPostService.findAll(where);
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
        const shopPost = await this.shopPostService.create(data, req.files as Express.Multer.File[], memberId);

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
        const shopPost = await this.shopPostService.update(+req.params.id, data, req.files as Express.Multer.File[], memberId);
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
