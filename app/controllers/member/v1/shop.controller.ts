import ShopService, {
    RpcShopUpdateParams,
} from "../../../services/member/v1/shop.service";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { createShopSchema, updateShopSchema } from "../../../schemas/member/v1/shop.schema";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { Member } from "@prisma/client";
import { memberShopScope } from "../../../scopes/member/v1/shop.scope";
import prisma from "../../../../prisma/client";
import {
    buildMemberShopWhere,
    formatMemberShop,
    memberShopInclude,
    parseMemberShopOrder,
} from "../../../helpers/member-shop.helper";

class ShopController {
    private shopService: ShopService;

    constructor() {
        this.shopService = new ShopService();
    }

    async memberShopList(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const filters = params.filters;
        const offset = Number(params.offset ?? 0);
        const limit = Number(params.limit ?? 0);
        const where = buildMemberShopWhere(filters);
        const orderBy = parseMemberShopOrder(params.order);
        const currentMemberId = (req.user as Member | undefined)?.id;

        const [count, shops] = await Promise.all([
            prisma.shop.count({ where }),
            prisma.shop.findMany({
                where,
                orderBy,
                ...(Number.isFinite(offset) && offset > 0 ? { skip: offset } : {}),
                ...(Number.isFinite(limit) && limit > 0 ? { take: limit } : {}),
                include: memberShopInclude,
            }),
        ]);

        const results = shops.map((shop) =>
            formatMemberShop(shop, currentMemberId)
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

    async memberShopCreate(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const memberId = (req.user as Member).id;
        const shop = await this.shopService.createFromRpcParams(params, memberId);
        const data = formatMemberShop(shop, memberId);

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data,
            },
        });
    }

    async memberShopUpdate(req: Request, res: Response) {
        const params = (req.body?.params ?? {}) as RpcShopUpdateParams;
        const memberId = (req.user as Member).id;
        const shop = await this.shopService.updateFromRpcParams(
            +req.params.id,
            params,
            memberId
        );
        const data = formatMemberShop(shop, memberId);

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                message: "Update Successfully.",
                data,
            },
        });
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;
        const where = memberShopScope(req.query);

        if (page && perPage) {
            const shops = await this.shopService.findByPaginate(+page, +perPage, where);
            return successResponse(res, "Shop list successfully", shops);
        }

        const shops = await this.shopService.findAll(where);
        return successResponse(res, "Shop list successfully", shops);
    }

    async findOne(req: Request, res: Response) {
        const shop = await this.shopService.findOne(+req.params.id);
        return successResponse(res, "Shop details successfully", shop);
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createShopSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to create shop", error);
        }

        const memberId = (req.user as Member).id;
        const files = req.files as Express.Multer.File[] ?? [];
        const shop = await this.shopService.create(data, files, memberId);
        return successResponse(res, "Shop created successfully", shop);
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateShopSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to update shop", error);
        }

        const id = +req.params.id;
        const memberId = (req.user as Member).id;
        const files = req.files as Express.Multer.File[] ?? [];
        const shop = await this.shopService.update(id, data, files, memberId);
        return successResponse(res, "Shop updated successfully", shop);
    }

    async destroy(req: Request, res: Response) {
        await this.shopService.destroy(+req.params.id, (req.user as Member).id);
        return successResponse(res, "Shop deleted successfully");
    }
}

export default ShopController;