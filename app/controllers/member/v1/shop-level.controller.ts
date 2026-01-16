import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import ShopLevelService from "../../../services/member/v1/shop-level.service";

class ShopLevelController {
    private shopLevelService: ShopLevelService;

    constructor() {
        this.shopLevelService = new ShopLevelService();
    }

    async findAll(req: Request, res: Response) {
        const shopLevels = await this.shopLevelService.findAll();
        return successResponse(res, "Shop level list successfully", shopLevels);
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;

        const shopLevel = await this.shopLevelService.findOne(+id);

        return successResponse(res, "Shop level fetched successfully", shopLevel);
    }

    async findCommonAll(req: Request, res: Response) {
        const shopLevels = await this.shopLevelService.findCommonAll();
        return successResponse(res, "Common shop level list successfully", shopLevels);
    }
}

export default ShopLevelController;