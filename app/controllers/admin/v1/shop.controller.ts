import { Request, Response } from "express";
import ShopService from "../../../services/admin/v1/shop.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createShopSchema,
  updateShopSchema,
} from "../../../schemas/admin/v1/shop.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { ShopCollection } from "../../../resources/admin/v1/shop/shop.collection";
import { ShopResource } from "../../../resources/admin/v1/shop/shop.resource";
import { Prisma } from "@prisma/client";

class ShopController {
  private shopService: ShopService;

  constructor() {
    this.shopService = new ShopService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const shops = await this.shopService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Shop list successfully",
        ShopCollection.withPagination(shops)
      );
    }

    const shops = await this.shopService.findAll();
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
    const { search } = req.query;

    const where: Prisma.ShopWhereInput = {};

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive"
      };
    }

    const shops = await this.shopService.findCommonAll();

    return successResponse(
      res,
      "Shop list successfully",
      ShopCollection.toCommonCollection(shops)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createShopSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create shop", error);
    }

    const shop = await this.shopService.create(data);
    return successResponse(
      res,
      "Shop created successfully",
      ShopResource.toResource(shop)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateShopSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update shop", error);
    }

    const shop = await this.shopService.update(+req.params.id, data);
    return successResponse(
      res,
      "Shop updated successfully",
      ShopResource.toResource(shop)
    );
  }

  async destroy(req: Request, res: Response) {
    const shop = await this.shopService.destroy(+req.params.id);
    return successResponse(
      res,
      "Shop deleted successfully",
      ShopResource.toResource(shop)
    );
  }
}

export default ShopController;

