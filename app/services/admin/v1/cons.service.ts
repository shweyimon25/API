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
    const { name, guard } = createConsInput;

    // Check guard is unique
    const existingGuard = await prisma.cons.findFirst({
      where: {
        guard,
      },
    });

    if (existingGuard) {
      throw new ValidationException("Failed to create cons", [
        {
          field: "guard",
          issue: "Guard is already existed",
        },
      ]);
    }

    // Create cons
    const cons = await prisma.cons.create({
      data: {
        name,
        guard,
      },
    });

    return this.findOne(cons.id);
  }

  async update(id: number, updateConsInput: UpdateConsInput) {
    const { name, guard } = updateConsInput;

    // Check cons exists
    const existingCons = await prisma.cons.findUnique({
      where: {
        id,
      },
    });

    if (!existingCons) {
      throw new BadRequestException("Cons not found");
    }

    // Check guard is unique if provided
    if (guard) {
      const existingGuard = await prisma.cons.findFirst({
        where: {
          guard,
          NOT: {
            id,
          },
        },
      });

      if (existingGuard) {
        throw new ValidationException("Failed to update cons", [
          {
            field: "guard",
            issue: "Guard is already existed",
          },
        ]);
      }
    }

    // Update cons
    await prisma.cons.update({
      where: {
        id,
      },
      data: {
        name: name || existingCons.name,
        guard: guard || existingCons.guard,
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

