import ShopService from "../../../services/member/v1/shop.service";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";

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
}

export default ShopController;