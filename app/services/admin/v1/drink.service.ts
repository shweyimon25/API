import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { CreateDrinkInput, UpdateDrinkInput } from "../../../schemas/admin/v1/drink.schema";

class DrinkService {
  async findAll() {
    const drinks = await prisma.drink.findMany({
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

    return drinks;
  }

  async findByPaginate(page: number, perPage: number) {
    const drinks = await prisma.drink.findMany({
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

    const totalDrinks = await prisma.drink.count();

    return {
      data: drinks,
      meta: {
        totalCount: totalDrinks,
        totalPages: Math.ceil(totalDrinks / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalDrinks / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalDrinks / perPage),
      },
    };
  }

  async findOne(id: number) {
    const drink = await prisma.drink.findUnique({
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

    if (!drink) {
      throw new BadRequestException("Drink not found");
    }

    return drink;
  }

  async create(createDrinkInput: CreateDrinkInput) {
    const { name } = createDrinkInput;

    const drink = await prisma.drink.create({
      data: {
        name,
      },
    });

    return this.findOne(drink.id);
  }

  async update(id: number, updateDrinkInput: UpdateDrinkInput) {
    const { name } = updateDrinkInput;

    const drink = await prisma.drink.findUnique({
      where: {
        id,
      },
    });

    if (!drink) {
      throw new BadRequestException("Drink not found");
    }

    await prisma.drink.update({
      where: {
        id,
      },
      data: {
        name: name || drink.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.drink.delete({ where: { id } });
  }
}

export default DrinkService;
