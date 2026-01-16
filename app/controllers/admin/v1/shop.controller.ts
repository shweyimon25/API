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
import { Prisma, Status } from "@prisma/client";

class ShopController {
  private shopService: ShopService;

  constructor() {
    this.shopService = new ShopService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name, status, shopLevelId, memberId } = req.query;

    let where: Prisma.ShopWhereInput = {};

    if (name) {
      where.OR = [
        {
          name: {
            contains: name as string,
          },
        },
        {
          member: {
            name: {
              contains: name as string,
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status as Status;
    }

    if (shopLevelId) {
      where.shopLevelId = +shopLevelId;
    }

    if (memberId) {
      where.memberId = +memberId;
    }

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
    const { name } = req.query;

    let where: Prisma.ShopWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    const shops = await this.shopService.findCommonAll(where);

    return successResponse(
      res,
      "Shop list successfully",
      ShopCollection.toCommonCollection(shops)
    );
  }
}

export default ShopController;

