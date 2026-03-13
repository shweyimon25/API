import prisma from "../../../../prisma/client";
import {
  NotFoundException,
} from "../../../helpers/exceptions";
import { Prisma, Status } from "@prisma/client";

class MealService {
  async findAll(where?: Prisma.MealWhereInput) {
    const meals = await prisma.meal.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
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

    return meals;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.MealWhereInput) {
    const meals = await prisma.meal.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
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
        status: Status.ACTIVE,
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
}

export default MealService;
