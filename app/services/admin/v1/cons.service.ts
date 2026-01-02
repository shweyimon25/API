import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  NotFoundException,
} from "../../../helpers/exceptions";
import { toKebabCase } from "../../../helpers/helper";
import {
  CreateConsInput,
  UpdateConsInput,
} from "../../../schemas/admin/v1/cons.schema";
import { Status } from "@prisma/client";

interface ConsFilters {
  status?: Status;
  search?: string;
}

class ConsService {
  private where(filters?: ConsFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { guard: { contains: filters.search } }
      ];
    }

    return where;
  }

  async findAll(filters?: ConsFilters) {
    const cons = await prisma.cons.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return cons;
  }

  async findCommonAll(filters?: ConsFilters) {
    const cons = await prisma.cons.findMany({
      where: {
        ...this.where(filters),
        status: Status.ACTIVE
      },
      orderBy: {
        id: "desc"
      }
    });

    return cons;
  }

  async findByPaginate(page: number, perPage: number, filters?: ConsFilters) {
    const cons = await prisma.cons.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const totalCons = await prisma.cons.count({
      where: this.where(filters),
    });

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
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!cons) {
      throw new NotFoundException("Cons not found");
    }

    return cons;
  }

  async create(createConsInput: CreateConsInput, userId: number) {
    const { name, status } = createConsInput;

    // Create cons
    const cons = await prisma.cons.create({
      data: {
        name,
        guard: toKebabCase(name),
        status: status ?? Status.ACTIVE,
        createdBy: {
          connect: {
            id: userId
          }
        }
      },
    });

    return this.findOne(cons.id);
  }

  async update(id: number, updateConsInput: UpdateConsInput, userId: number) {
    const { name, status } = updateConsInput;

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
        name: name ?? existingCons.name,
        status: status ?? existingCons.status,
        updatedBy: {
          connect: {
            id: userId
          }
        }
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

