import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateMealInput,
  UpdateMealInput,
} from "../../../schemas/admin/v1/meal.schema";
import { Prisma, Status } from "@prisma/client";

class MealService {
  async findAll(where?: Prisma.MealWhereInput) {
    const meals = await prisma.meal.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      include: {
        mealType: {
          select: {
            id: true,
            name: true,
          },
        },
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

    return meals;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.MealWhereInput) {
    const meals = await prisma.meal.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        mealType: {
          select: {
            id: true,
            name: true,
          },
        },
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

    const totalCount = await prisma.meal.count({
      where,
    });

    return {
      data: meals,
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
    const meal = await prisma.meal.findUnique({
      where: {
        id,
      },
      include: {
        mealType: {
          select: {
            id: true,
            name: true,
          },
        },
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

    if (!meal) {
      throw new NotFoundException("Meal not found");
    }

    return meal;
  }

  async findCommonAll(where?: Prisma.MealWhereInput) {
    const meals = await prisma.meal.findMany({
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

    return meals;
  }

  async create(createMealInput: CreateMealInput, userId: number) {
    const { name, cal, carb, protein, fat, mealTypeId, status } =
      createMealInput;

    // Check meal name exists
    const existingMealName = await prisma.meal.findFirst({
      where: {
        name,
      },
    });

    if (existingMealName) {
      throw new ValidationException("Failed to create meal", [
        {
          field: "name",
          issue: "Name already exists",
        },
      ]);
    }

    // Check meal type exists
    const existingMealType = await prisma.mealType.findUnique({
      where: {
        id: mealTypeId,
      },
    });

    if (!existingMealType) {
      throw new ValidationException("Failed to create meal", [
        {
          field: "mealTypeId",
          issue: "Meal type not found",
        },
      ]);
    }

    const meal = await prisma.meal.create({
      data: {
        name,
        cal,
        carb,
        protein,
        fat,
        mealTypeId,
        status: status ?? Status.ACTIVE,
        createdById: userId,
      },
    });

    return this.findOne(meal.id);
  }

  async update(id: number, updateMealInput: UpdateMealInput, userId: number) {
    const { name, cal, carb, protein, fat, mealTypeId, status } =
      updateMealInput;

    const existing = await this.findOne(id);

    // Check meal type exists if being updated
    if (mealTypeId && mealTypeId !== existing.mealTypeId) {
      const mealType = await prisma.mealType.findUnique({
        where: {
          id: mealTypeId,
        },
      });

      if (!mealType) {
        throw new ValidationException("Failed to update meal", [
          {
            field: "mealTypeId",
            issue: "Meal type not found",
          },
        ]);
      }
    }

    await prisma.meal.update({
      where: {
        id,
      },
      data: {
        name: name ?? existing.name,
        cal: cal ?? existing.cal,
        carb: carb ?? existing.carb,
        protein: protein ?? existing.protein,
        fat: fat ?? existing.fat,
        mealTypeId: mealTypeId ?? existing.mealTypeId,
        status: status ?? existing.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const meal = await this.findOne(id);

    await prisma.meal.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return meal;
  }
}

export default MealService;
