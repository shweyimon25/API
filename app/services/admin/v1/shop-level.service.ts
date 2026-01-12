import {
  CreateShopLevelInput,
  UpdateShopLevelInput,
} from "./../../../schemas/admin/v1/shop-level.schema";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import { Prisma, Status } from "@prisma/client";

class ShopLevelService {
  async findAll(where?: Prisma.ShopLevelWhereInput) {
    const shopLevels = await prisma.shopLevel.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return shopLevels;
  }

  async findByPaginate(page: number, perPage: number, where: Prisma.ShopLevelWhereInput) {
    const shopLevels = await prisma.shopLevel.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalShopLevels = await prisma.shopLevel.count({
      where,
    });

    return {
      data: shopLevels,
      meta: {
        totalCount: totalShopLevels,
        totalPages: Math.ceil(totalShopLevels / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalShopLevels / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalShopLevels / perPage),
      },
    };
  }

  async findOne(id: number) {
    const shopLevel = await prisma.shopLevel.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!shopLevel) {
      throw new BadRequestException("Shop level not found");
    }

    return shopLevel;
  }

  async findCommonAll(where?: Prisma.ShopLevelWhereInput) {
    const shopLevels = await prisma.shopLevel.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
        deletedAt: null
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return shopLevels;
  }

  async create(createShopLevelInput: CreateShopLevelInput, userId: number) {
    const { name, price, duration, description, status, postLimit } = createShopLevelInput;

    const shopLevelName = await prisma.shopLevel.findFirst({
      where: {
        name,
      },
    });

    if (shopLevelName) {
      throw new ValidationException("Failed to create shop level", [
        {
          field: "name",
          issue: "Name is already existed",
        },
      ]);
    }

    const shopLevel = await prisma.shopLevel.create({
      data: {
        name,
        price,
        duration,
        description,
        postLimit,
        status: status ?? Status.ACTIVE,
        createdBy: {
          connect: {
            id: userId
          }
        }
      },
    });

    return this.findOne(shopLevel.id);
  }

  async update(id: number, updateShopLevelInput: UpdateShopLevelInput, userId: number) {
    const { name, price, duration, description, status, postLimit } = updateShopLevelInput;

    const existingShopLevel = await prisma.shopLevel.findUnique({
      where: {
        id,
      },
    });

    if (!existingShopLevel) {
      throw new BadRequestException("Shop level not found");
    }

    if (name && name !== existingShopLevel.name) {
      const shopLevelName = await prisma.shopLevel.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
      });

      if (shopLevelName) {
        throw new ValidationException("Failed to update shop level", [
          {
            field: "name",
            issue: "Name is already existed",
          },
        ]);
      }
    }

    // Update shop level
    await prisma.shopLevel.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingShopLevel.name,
        price: price ?? existingShopLevel.price,
        duration: duration ?? existingShopLevel.duration,
        description:
          description ??
          existingShopLevel.description,
        postLimit: postLimit ?? existingShopLevel.postLimit,
        status: status ?? existingShopLevel.status,
        updatedBy: {
          connect: {
            id: userId
          }
        }
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number, userId: number) {
    await this.findOne(id);

    await prisma.shopLevel.update({
      where: {
        id
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
        deletedBy: {
          connect: {
            id: userId
          }
        }
      }
    });
  }
}

export default ShopLevelService;
