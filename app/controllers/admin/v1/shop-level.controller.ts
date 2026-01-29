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
import { User } from "@prisma/client";
import { shopLevelScope } from "../../../scopes/admin/v1/shop-level.scope";

class ShopLevelController {
  private shopLevelService: ShopLevelService;

  constructor() {
    this.shopLevelService = new ShopLevelService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = shopLevelScope(req.query);

    if (page && perPage) {
      const shopLevels = await this.shopLevelService.findByPaginate(
        +page,
        +perPage,
        where
      );

      return successResponse(
        res,
        "Shop level list successfully",
        ShopLevelCollection.withPagination(shopLevels)
      );
    }

    const shopLevels = await this.shopLevelService.findAll(where);

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

  async findCommonAll(req: Request, res: Response) {
    const where = shopLevelScope(req.query);

    const shopLevels = await this.shopLevelService.findCommonAll(where);

    return successResponse(
      res,
      "Shop level list successfully",
      ShopLevelCollection.toCollection(shopLevels)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(createShopLevelSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to create shop level", error);
    }

    const userId = (req.user as User)?.id;
    const shopLevel = await this.shopLevelService.create(data, +userId);

    return successResponse(
      res,
      "Shop level created successfully",
      ShopLevelResource.toResource(shopLevel)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(updateShopLevelSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to update shop level", error);
    }

    const { id } = req.params;
    const userId = (req.user as User)?.id;
    const shopLevel = await this.shopLevelService.update(+id, data, +userId);

    return successResponse(
      res,
      "Shop level updated successfully",
      ShopLevelResource.toResource(shopLevel)
    );
  }

  async destory(req: Request, res: Response) {
    const { id } = req.params;
    const userId = (req.user as User)?.id;
    await this.shopLevelService.destroy(+id, userId);
    return successResponse(
      res,
      "Shop level deleted successfully"
    );
  }
}

export default ShopLevelController;
