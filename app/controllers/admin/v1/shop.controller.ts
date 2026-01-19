import { Request, Response } from "express";
import ShopService from "../../../services/admin/v1/shop.service";
import { successResponse } from "../../../helpers/response";
import { ShopCollection } from "../../../resources/admin/v1/shop/shop.collection";
import { ShopResource } from "../../../resources/admin/v1/shop/shop.resource";
import { shopScope } from "../../../scopes/admin/v1/shop.scope";

class ShopController {
  private shopService: ShopService;

  constructor() {
    this.shopService = new ShopService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = shopScope(req.query);

    if (page && perPage) {
      const shops = await this.shopService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Shop list successfully",
        ShopCollection.withPagination(shops)
      );
    }

    const shops = await this.shopService.findAll(where);
    return successResponse(
      res,
      "Shop list successfully",
      ShopCollection.toCollection(shops)
    );
  }

  async findOne(req: Request, res: Response) {
    const shop = await this.shopService.findOne(+req.params.id);
    return successResponse(
      res,
      "Shop details successfully",
      ShopResource.toResource(shop)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = shopScope(req.query);
    const shops = await this.shopService.findCommonAll(where);

    return successResponse(
      res,
      "Shop list successfully",
      ShopCollection.toCommonCollection(shops)
    );
  }
}

export default ShopController;

