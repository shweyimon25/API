import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import {
  CreateCuisineInput,
  UpdateCuisineInput,
} from "../../../schemas/admin/v1/cuisine.schema";

class CuisineService {
  async findAll() {
    const cuisines = await prisma.cuisine.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return cuisines;
  }

  async findByPaginate(page: number, perPage: number) {
    const cuisines = await prisma.cuisine.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalCuisines = await prisma.cuisine.count();

    return {
      data: cuisines,
      meta: {
        totalCount: totalCuisines,
        totalPages: Math.ceil(totalCuisines / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCuisines / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCuisines / perPage),
      },
    };
  }

  async findOne(id: number) {
    const cuisine = await prisma.cuisine.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!cuisine) {
      throw new BadRequestException("Cuisine not found");
    }

    return cuisine;
  }

  async create(createCuisineInput: CreateCuisineInput) {
    const { name } = createCuisineInput;

    const cuisine = await prisma.cuisine.create({
      data: {
        name,
      },
    });

    return this.findOne(cuisine.id);
  }

  async update(id: number, updateCuisineInput: UpdateCuisineInput) {
    const { name } = updateCuisineInput;

    const cuisine = await prisma.cuisine.findUnique({
      where: {
        id,
      },
    });

    if (!cuisine) {
      throw new BadRequestException("Cuisine not found");
    }

    await prisma.cuisine.update({
      where: {
        id,
      },
      data: {
        name: name || cuisine.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.cuisine.delete({ where: { id } });
  }
}

export default CuisineService;
