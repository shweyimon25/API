import ShopService from "../../../services/member/v1/shop.service";
import { Request, Response } from "express";
import { Member, User } from "@prisma/client";
import prisma from "../../../../prisma/client";
import {
  buildMemberShopWhere,
  formatMemberShop,
  memberShopInclude,
  parseMemberShopOrder,
} from "../../../helpers/member-shop.helper";
import { upload } from "../../../helpers/media-upload";

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
      formatMemberShop(shop, currentMemberId),
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
    if (!req.files) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Image is required",
          data: null,
        },
      });
    }

    // Current member
    const { id } = req.user as User;

    // Check Shop Already Exist
    const shopExisted = await prisma.shop.findFirst({
      where: {
        memberId: id,
      },
    });

    if (shopExisted) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Shop is already exist",
          data: null,
        },
      });
    }

    const currentMember = await prisma.member.findFirst({
      where: {
        id,
      },
      include: {
        profile: true
      }
    });

    // Upload To OSS
    const files = req.files as Express.Multer.File[];

    const file = files.find((f) => f.fieldname === "image");

    if (!file) {
      throw new Error("Image is required");
    }

    const { fileUrl } = await upload(file, "shop");

    const shop = await prisma.shop.create({
      data: {
        name: req.body.name,
        logo: fileUrl,
        member: {
          connect: { id: id },
        },
        shopLevel: {
          connect: { id: 8 },
        },
      },
      include: {
        shopLevel: true,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Shop created successfully",
        data: {
          id: shop.id,
          name: shop.name,
          partner_id: {
            id: currentMember?.id,
            name: currentMember?.name,
            image_1920: currentMember?.profile?.coverPhoto ?? ""
          },
          member_type_level_id: {
            id: shop.shopLevel?.id,
            name: shop.shopLevel?.name,
            count: shop.shopLevel?.postLimit,
          },
          create_date: shop.createdAt,
          image: shop.logo,
          total_post: 0.0,
          rate_count: 0.0,
          total_rate_user_count: 0.0,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0,
          remaining_post: 10,
          is_rate: null,
        },
      },
    });
  }

  async memberShopUpdate(req: Request, res: Response) {
    const { id } = req.user as Member;

    const existingShop = await prisma.shop.findUnique({
      where: {
        memberId: id,
        id: +req.params.id,
      }
    });

    if (!existingShop) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Shop not found",
        },
      });
    }

    let fileUrlPath;

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const file = files.find((f) => f.fieldname === "image");
      const { fileUrl } = await upload(file, "shop");
      fileUrlPath = fileUrl;
    }

    const updateShop = await prisma.shop.update({
      where: {
        id: existingShop.id,
      },
      data: {
        name: req.body.name,
        logo: fileUrlPath,
      },
      include: {
        member: true,
        shopLevel: true,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Update Successfully.",
        data: {
          "id": updateShop.id,
          "name": updateShop.name,
          "partner_id": {
            "id": updateShop.member?.id,
            "image_1920": updateShop.logo,
            "name": updateShop.member?.name,
          },
          "member_type_level_id": {
            "id": updateShop.shopLevelId,
            "name": updateShop.shopLevel?.name,
            "count": updateShop.shopLevel?.postLimit,
          },
          "create_date": updateShop.createdAt,
          "image": updateShop.logo,
          "total_post": 0,
          "rate_count": 0.0,
          "total_rate_user_count": 0.0,
          "five_star": 0,
          "four_star": 0,
          "three_star": 0,
          "two_star": 0,
          "one_star": 0,
          "remaining_post": 10,
          "is_rate": null
        }
      }
    });

  }

  async memberShopResultCheck(req: Request, res: Response) {
    const { id } = req.user as Member;

    const memberHasShop = await prisma.shop.findUnique({
      where: {
        memberId: id,
      },
    });

    if (!memberHasShop) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You don't have a shop.",
        },
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "You have a shop.",
      },
    });
  }
}

export default ShopController;
