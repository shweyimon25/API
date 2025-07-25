import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { CreateDietaryInput, UpdateDietaryInput } from "../../../schemas/admin/v1/dietary.schema";

class DietaryService {
  async findAll() {
    const dietaries = await prisma.dietary.findMany({
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

    return dietaries;
  }

  async findByPaginate(page: number, perPage: number) {
    const dietaries = await prisma.dietary.findMany({
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

    const totalDietaries = await prisma.dietary.count();

    return {
      data: dietaries,
      meta: {
        totalCount: totalDietaries,
        totalPages: Math.ceil(totalDietaries / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalDietaries / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalDietaries / perPage),
      },
    };
  }

  async findOne(id: number) {
    const dietary = await prisma.dietary.findUnique({
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

    if (!dietary) {
      throw new BadRequestException("Dietary not found");
    }

    return dietary;
  }

  async create(createDietaryInput: CreateDietaryInput) {
    const { name } = createDietaryInput;

    const dietary = await prisma.dietary.create({
      data: {
        name,
      },
    });

    return this.findOne(dietary.id);
  }

  async update(id: number, updateDietaryInput: UpdateDietaryInput) {
    const { name } = updateDietaryInput;

    const dietary = await prisma.dietary.findUnique({
      where: {
        id,
      },
    });

    if (!dietary) {
      throw new BadRequestException("Dietary not found");
    }

    await prisma.dietary.update({
      where: {
        id,
      },
      data: {
        name: name || dietary.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.dietary.delete({ where: { id } });
  }
}

export default DietaryService;
