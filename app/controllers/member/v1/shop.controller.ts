import ShopService, {
  RpcShopUpdateParams,
} from "../../../services/member/v1/shop.service";
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

    const currentMember = await prisma.member.findFirst({
      where: {
        id,
      },
    });

    // Upload To OSS
    const file = req.files;
    const { fileUrl } = await upload(file, "shop");

    const shop = await prisma.shop.create({
      data: {
        name: req.body.name,
        logo: fileUrl,
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
            image_1920:
              "http://localhost:8069/web/content/?model=res.partner&id=12&field=image_1920",
          },
          member_type_level_id: {
            id: 1,
            name: "Free Shop Plan",
            count: 10,
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
    const params = (req.body?.params ?? {}) as RpcShopUpdateParams;
    const memberId = (req.user as Member).id;
    const shop = await this.shopService.updateFromRpcParams(
      +req.params.id,
      params,
      memberId,
    );
    const data = formatMemberShop(shop, memberId);

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Update Successfully.",
        data,
      },
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
          isFullFilled: true,
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
