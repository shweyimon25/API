import {
  CreateShopLevelInput,
  UpdateShopLevelInput,
} from "./../../../schemas/admin/v1/shop-level.schema";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";

class ShopLevelService {
  async findAll() {
    const shopLevels = await prisma.shopLevel.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return shopLevels;
  }

  async findByPaginate(page: number, perPage: number) {
    const shopLevels = await prisma.shopLevel.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalShopLevels = await prisma.shopLevel.count();

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
    });

    if (!shopLevel) {
      throw new BadRequestException("Shop level not found");
    }

    return shopLevel;
  }

  async create(createShopLevelInput: CreateShopLevelInput) {
    const { name, price, duration, description } = createShopLevelInput;

    // Check shop level name unique
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

    // Create new shop level
    const shopLevel = await prisma.shopLevel.create({
      data: {
        ...createShopLevelInput,
      },
    });

    return this.findOne(shopLevel.id);
  }

  async update(id: number, updateShopLevelInput: UpdateShopLevelInput) {
    const { name, price, duration, description } = updateShopLevelInput;

    // Check shop level exists
    const existingShopLevel = await prisma.shopLevel.findUnique({
      where: {
        id,
      },
    });

    if (!existingShopLevel) {
      throw new BadRequestException("Shop level not found");
    }

    // Check shop level name unique if name is being updated
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
        name: name || existingShopLevel.name,
        price: price !== undefined ? price : existingShopLevel.price,
        duration:
          duration !== undefined ? duration : existingShopLevel.duration,
        description:
          description !== undefined
            ? description
            : existingShopLevel.description,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    // Find shop level
    const shopLevel = await this.findOne(id);

    // Delete shop level
    await prisma.shopLevel.delete({
      where: {
        id,
      },
    });

    return shopLevel;
  }
}

export default ShopLevelService;
