import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateMealTypeInput,
  UpdateMealTypeInput,
} from "../../../schemas/admin/v1/meal-type.schema";
import { Prisma, Status } from "@prisma/client";

class MealTypeService {
  async findAll(where?: Prisma.MealTypeWhereInput) {
    const mealTypes = await prisma.mealType.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    return mealTypes;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.MealTypeWhereInput
  ) {
    const mealTypes = await prisma.mealType.findMany({
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
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    const totalCount = await prisma.mealType.count({
      where,
    });

    return {
      data: mealTypes,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCount / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCount / perPage),
      },
    };
  }

  async findOne(id: number) {
    const mealType = await prisma.mealType.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!mealType) {
      throw new NotFoundException("Meal type not found");
    }

    return mealType;
  }

  async findCommonAll(where?: Prisma.MealTypeWhereInput) {
    const mealTypes = await prisma.mealType.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return mealTypes;
  }

  async create(createMealTypeInput: CreateMealTypeInput, userId: number) {
    const { name, status } = createMealTypeInput;

    const existing = await prisma.mealType.findUnique({
      where: {
        name,
      },
    });

    if (existing) {
      throw new ValidationException("Failed to create meal type", [
        {
          field: "name",
          issue: "Name already exists",
        },
      ]);
    }

    const mealType = await prisma.mealType.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(mealType.id);
  }

  async update(
    id: number,
    updateMealTypeInput: UpdateMealTypeInput,
    userId: number
  ) {
    const { name, status } = updateMealTypeInput;

    const existing = await this.findOne(id);

    if (name && name !== existing.name) {
      const nameExists = await prisma.mealType.findUnique({
        where: {
          name,
        },
      });

      if (nameExists) {
        throw new ValidationException("Failed to update meal type", [
          {
            field: "name",
            issue: "Name already exists",
          },
        ]);
      }
    }

    await prisma.mealType.update({
      where: {
        id,
      },
      data: {
        name: name ?? existing.name,
        status: status ?? existing.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const mealType = await this.findOne(id);

    await prisma.mealType.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return mealType;
  }
}

export default MealTypeService;
