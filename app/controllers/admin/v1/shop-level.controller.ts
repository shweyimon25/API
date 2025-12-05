import { Request, Response } from "express";
import ShopLevelService from "../../../services/admin/v1/shop-level.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createShopLevelSchema,
  updateShopLevelSchema,
} from "../../../schemas/admin/v1/shop-level.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { ShopLevelCollection } from "../../../resources/admin/v1/shop-level/shop-level.collection";
import { ShopLevelResource } from "../../../resources/admin/v1/shop-level/shop-level.resource";

class ShopLevelController {
  private shopLevelService: ShopLevelService;

  constructor() {
    this.shopLevelService = new ShopLevelService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const shopLevels = await this.shopLevelService.findByPaginate(
        +page,
        +perPage
      );
      return successResponse(
        res,
        "Shop level list successfully",
        ShopLevelCollection.withPagination(shopLevels)
      );
    }

    const shopLevels = await this.shopLevelService.findAll();
    return successResponse(
      res,
      "Shop level list successfully",
      ShopLevelCollection.toCollection(shopLevels)
    );
  }

  async findOne(req: Request, res: Response) {
    const shopLevel = await this.shopLevelService.findOne(+req.params.id);
    return successResponse(
      res,
      "Shop level details successfully",
      ShopLevelResource.toResource(shopLevel)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createShopLevelSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create shop level", error);
    }

    const shopLevel = await this.shopLevelService.create(data);
    return successResponse(
      res,
      "Shop level created successfully",
      ShopLevelResource.toResource(shopLevel)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateShopLevelSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update shop level", error);
    }

    const shopLevel = await this.shopLevelService.update(+req.params.id, data);
    return successResponse(
      res,
      "Shop level updated successfully",
      ShopLevelResource.toResource(shopLevel)
    );
  }

  async destory(req: Request, res: Response) {
    const shopLevel = await this.shopLevelService.destroy(+req.params.id);
    return successResponse(
      res,
      "Shop level deleted successfully",
      ShopLevelResource.toResource(shopLevel)
    );
  }
}

export default ShopLevelController;
