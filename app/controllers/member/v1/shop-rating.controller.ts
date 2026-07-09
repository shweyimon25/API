import { Request, Response } from "express";
import ShopRatingService from "../../../services/member/v1/shop-rating.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { BadRequestException, ValidationException } from "../../../helpers/exceptions";
import { createShopRatingSchema, updateShopRatingSchema } from "../../../schemas/member/v1/shop-rating.schema";
import { Member } from "@prisma/client";
import { ShopRatingCollection } from "../../../resources/member/v1/shop-rating/shop-rating.collection";
import { ShopRatingResource } from "../../../resources/member/v1/shop-rating/shop-rating.resource";
import prisma from "../../../../prisma/client";
import {
    buildMemberShopRatingWhere,
    formatMemberShopRating,
    memberShopRatingInclude,
    parseMemberShopRatingOrder,
} from "../../../helpers/member-shop-rating.helper";

class ShopRatingController {
    private shopRatingService: ShopRatingService;

    constructor() {
        this.shopRatingService = new ShopRatingService();
    }

    async memberShopRateList(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const offset = Number(params.offset ?? 0);
        const limit = Number(params.limit ?? 0);
        const where = buildMemberShopRatingWhere(params.filters);
        const orderBy = parseMemberShopRatingOrder(params.order);

        const [count, ratings] = await Promise.all([
            prisma.shopRating.count({ where }),
            prisma.shopRating.findMany({
                where,
                orderBy,
                ...(Number.isFinite(offset) && offset > 0 ? { skip: offset } : {}),
                ...(Number.isFinite(limit) && limit > 0 ? { take: limit } : {}),
                include: memberShopRatingInclude,
            }),
        ]);

        const results = ratings.map((rating) => formatMemberShopRating(rating));

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

    async memberShopRateCreate(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const memberId = (req.user as Member).id;
        const shopRating = await this.shopRatingService.createFromRpcParams(
            params,
            memberId,
        );
        const data = formatMemberShopRating(shopRating);

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data,
            },
        });
    }
}

export default ShopRatingController;
