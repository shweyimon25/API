import ShopService from "../../../services/member/v1/shop.service";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { createShopSchema, updateShopSchema } from "../../../schemas/member/v1/shop.schema";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { Member } from "@prisma/client";

class ShopController {
    private shopService: ShopService;

    constructor() {
        this.shopService = new ShopService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        if (page && perPage) {
            const shops = await this.shopService.findByPaginate(+page, +perPage);
            return successResponse(res, "Shop list successfully", shops);
        }

        const shops = await this.shopService.findAll();
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