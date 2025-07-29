import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import {
  CreateTypeInput,
  UpdateTypeInput,
} from "../../../schemas/admin/v1/type.schema";

class TypeService {
  async findAll() {
    const types = await prisma.type.findMany({
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

    return types;
  }

  async findByPaginate(page: number, perPage: number) {
    const types = await prisma.type.findMany({
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

    const totalTypes = await prisma.type.count();

    return {
      data: types,
      meta: {
        totalCount: totalTypes,
        totalPages: Math.ceil(totalTypes / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalTypes / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalTypes / perPage),
      },
    };
  }

  async findOne(id: number) {
    const type = await prisma.type.findUnique({
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

    if (!type) {
      throw new BadRequestException("Type not found");
    }

    return type;
  }

  async create(createTypeInput: CreateTypeInput) {
    const { name } = createTypeInput;

    const type = await prisma.type.create({
      data: {
        name,
      },
    });

    return this.findOne(type.id);
  }

  async update(id: number, updateTypeInput: UpdateTypeInput) {
    const { name } = updateTypeInput;

    const type = await prisma.type.findUnique({
      where: {
        id,
      },
    });

    if (!type) {
      throw new BadRequestException("Type not found");
    }

    await prisma.type.update({
      where: {
        id,
      },
      data: {
        name: name || type.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.type.delete({ where: { id } });
  }
}

export default TypeService;
