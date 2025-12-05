import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateConsInput,
  UpdateConsInput,
} from "../../../schemas/admin/v1/cons.schema";

class ConsService {
  async findAll() {
    const cons = await prisma.cons.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        guard: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return cons;
  }

  async findByPaginate(page: number, perPage: number) {
    const cons = await prisma.cons.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        guard: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalCons = await prisma.cons.count();

    return {
      data: cons,
      meta: {
        totalCount: totalCons,
        totalPages: Math.ceil(totalCons / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCons / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCons / perPage),
      },
    };
  }

  async findOne(id: number) {
    const cons = await prisma.cons.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        guard: true,
        createdAt: true,
        updatedAt: true,
        memberPlans: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!cons) {
      throw new BadRequestException("Cons not found");
    }

    return cons;
  }

  async create(createConsInput: CreateConsInput) {
    const { name } = createConsInput;

    // Create cons
    const cons = await prisma.cons.create({
      data: {
        name,
        guard: ""
      },
    });

    return this.findOne(cons.id);
  }

  async update(id: number, updateConsInput: UpdateConsInput) {
    const { name } = updateConsInput;

    // Check cons exists
    const existingCons = await prisma.cons.findUnique({
      where: {
        id,
      },
    });

    if (!existingCons) {
      throw new BadRequestException("Cons not found");
    }

    // Update cons
    await prisma.cons.update({
      where: {
        id,
      },
      data: {
        name: name || existingCons.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const cons = await this.findOne(id);

    await prisma.cons.delete({
      where: {
        id,
      },
    });

    return cons;
  }
}

export default ConsService;

