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
import { Prisma, Status } from "@prisma/client";

class ConsService {
  async findAll(where?: Prisma.ConsWhereInput) {
    const cons = await prisma.cons.findMany({
      where,
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

  async findCommonAll(where?: Prisma.ConsWhereInput) {
    const cons = await prisma.cons.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        id: "desc"
      }
    });

    return cons;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.ConsWhereInput) {
    const cons = await prisma.cons.findMany({
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
      where,
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

    await prisma.cons.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return cons;
  }
}

export default ConsService;

