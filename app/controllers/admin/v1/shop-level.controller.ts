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
import { Prisma, Status, User } from "@prisma/client";

class ShopLevelController {
  private shopLevelService: ShopLevelService;

  constructor() {
    this.shopLevelService = new ShopLevelService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, status, search, duration, postLimit, name, minPrice, maxPrice } = req.query;

    const where: Prisma.ShopLevelWhereInput = {};

    if (status) {
      where.status = status as Status;
    }

    if (duration) {
      where.duration = { equals: +duration as number };
    }

    if (postLimit) {
      where.postLimit = { equals: +postLimit as number };
    }

    if (search) {
      where.name = { contains: search as string, mode: "insensitive" };
    }

    if (name) {
      where.name = { equals: name as string };
    }

    if (minPrice) {
      where.price = { gte: +minPrice as number };
    }

    if (maxPrice) {
      where.price = { lte: +maxPrice as number };
    }

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
    const { search } = req.query;

    const where: Prisma.ShopLevelWhereInput = {};

    if (search) {
      where.name = { contains: search as string, mode: "insensitive" };
    }

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
    const { data, error } = await validater(updateShopLevelSchema, req.body);

    if (error) {
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
