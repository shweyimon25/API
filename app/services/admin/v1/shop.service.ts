import {
  CreateShopInput,
  UpdateShopInput,
} from "./../../../schemas/admin/v1/shop.schema";
import prisma from "../../../../prisma/client";
import { Status } from "@prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";

interface ShopFilters {
  status?: Status;
  search?: string;
  shopLevelId?: number;
  memberId?: number;
}

class ShopService {
  private where(filters?: ShopFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.shopLevelId) {
      where.shopLevelId = filters.shopLevelId;
    }

    if (filters?.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters?.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
          },
        },
        {
          member: {
            name: {
              contains: filters.search,
            },
          },
        },
      ];
    }

    return where;
  }

  async findAll(filters?: ShopFilters) {
    const shops = await prisma.shop.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
        shopLevel: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    return shops;
  }

  async findByPaginate(page: number, perPage: number, filters?: ShopFilters) {
    const shops = await prisma.shop.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
        shopLevel: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    const totalShops = await prisma.shop.count({
      where: this.where(filters),
    });

    return {
      data: shops,
      meta: {
        totalCount: totalShops,
        totalPages: Math.ceil(totalShops / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalShops / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalShops / perPage),
      },
    };
  }

  async findOne(id: number) {
    const shop = await prisma.shop.findUnique({
      where: {
        id,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true
          },
        },
        shopLevel: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    if (!shop) {
      throw new BadRequestException("Shop not found");
    }

    return shop;
  }

  async findCommonAll(filters?: ShopFilters) {
    const shops = await prisma.shop.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      }
    });
    return shops;
  }

  async create(createShopInput: CreateShopInput) {
    const { name, memberId, shopLevelId, status } = createShopInput;

    // Check member exists
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) {
      throw new ValidationException("Failed to create shop", [
        {
          field: "memberId",
          issue: "Member is not existed",
        },
      ]);
    }

    // Check if member already has a shop (memberId is unique)
    const existingShop = await prisma.shop.findUnique({
      where: {
        memberId,
      },
    });

    if (existingShop) {
      throw new ValidationException("Failed to create shop", [
        {
          field: "memberId",
          issue: "Member already has a shop",
        },
      ]);
    }

    // Check shop level exists if provided
    if (shopLevelId) {
      const shopLevel = await prisma.shopLevel.findUnique({
        where: {
          id: shopLevelId,
        },
      });

      if (!shopLevel) {
        throw new ValidationException("Failed to create shop", [
          {
            field: "shopLevelId",
            issue: "Shop level is not existed",
          },
        ]);
      }
    }

    // Create new shop
    const shop = await prisma.shop.create({
      data: {
        name,
        memberId,
        shopLevelId,
        status: status ?? Status.ACTIVE,
      },
    });

    return this.findOne(shop.id);
  }

  async update(id: number, updateShopInput: UpdateShopInput) {
    const { name, memberId, shopLevelId, status } = updateShopInput;

    // Check shop exists
    const existingShop = await prisma.shop.findUnique({
      where: {
        id,
      },
    });

    if (!existingShop) {
      throw new BadRequestException("Shop not found");
    }

    // Check member exists if memberId is being updated
    if (memberId && memberId !== existingShop.memberId) {
      const member = await prisma.member.findUnique({
        where: {
          id: memberId,
        },
      });

      if (!member) {
        throw new ValidationException("Failed to update shop", [
          {
            field: "memberId",
            issue: "Member is not existed",
          },
        ]);
      }

      // Check if the new member already has a shop
      const shopWithMember = await prisma.shop.findUnique({
        where: {
          memberId,
        },
      });

      if (shopWithMember) {
        throw new ValidationException("Failed to update shop", [
          {
            field: "memberId",
            issue: "Member already has a shop",
          },
        ]);
      }
    }

    // Check shop level exists if shopLevelId is being updated
    if (shopLevelId !== undefined) {
      if (shopLevelId !== null) {
        const shopLevel = await prisma.shopLevel.findUnique({
          where: {
            id: shopLevelId,
          },
        });

        if (!shopLevel) {
          throw new ValidationException("Failed to update shop", [
            {
              field: "shopLevelId",
              issue: "Shop level is not existed",
            },
          ]);
        }
      }
    }

    // Update shop
    await prisma.shop.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingShop.name,
        memberId: memberId ?? existingShop.memberId,
        shopLevelId:
          shopLevelId !== undefined ? shopLevelId : existingShop.shopLevelId,
        status: status ?? existingShop.status,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    // Find shop
    const shop = await this.findOne(id);

    // Delete shop
    await prisma.shop.delete({
      where: {
        id,
      },
    });

    return shop;
  }
}

export default ShopService;

