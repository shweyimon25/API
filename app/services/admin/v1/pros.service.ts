import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import { toKebabCase } from "../../../helpers/helper";
import {
  CreateProsInput,
  UpdateProsInput,
} from "../../../schemas/admin/v1/pros.schema";
import { Status } from "@prisma/client";

interface ProsFilters {
  status?: Status;
  search?: string;
}

class ProsService {
  private where(filters?: ProsFilters) {
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

  async findAll(filters?: ProsFilters) {
    const pros = await prisma.pros.findMany({
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
            name: true,
          }
        }
      }
    });

    return pros;
  }

  async findCommonAll(filters?: ProsFilters) {
    const pros = await prisma.pros.findMany({
      where: {
        ...this.where(filters),
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        guard: true
      }
    });

    return pros;
  }

  async findByPaginate(page: number, perPage: number, filters?: ProsFilters) {
    const pros = await prisma.pros.findMany({
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
            name: true,
          }
        }
      }
    });

    const totalPros = await prisma.pros.count({
      where: this.where(filters),
    });

    return {
      data: pros,
      meta: {
        totalCount: totalPros,
        totalPages: Math.ceil(totalPros / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalPros / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalPros / perPage),
      },
    };
  }

  async findOne(id: number) {
    const pros = await prisma.pros.findFirst({
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
            name: true,
          }
        }
      }
    });

    if (!pros) {
      throw new BadRequestException("Pros not found");
    }

    return pros;
  }

  async create(createProsInput: CreateProsInput, userId: number) {
    const { name, status } = createProsInput;

    // Check pros name unique
    const prosName = await prisma.pros.findFirst({
      where: {
        name,
      },
    });

    if (prosName) {
      throw new ValidationException("Failed to created pros", [
        {
          field: "name",
          issue: "Name is already existed",
        },
      ]);
    }

    // Create pros
    const pros = await prisma.pros.create({
      data: {
        name,
        guard: toKebabCase(name),
        status: status ?? Status.ACTIVE,
        createdBy: {
          connect: { id: userId }
        },
      },
    });

    return this.findOne(pros.id);
  }

  async update(prosId: number, updateProsInput: UpdateProsInput, userId: number) {
    const { name } = updateProsInput;

    // Check pros existed
    const existingPros = await prisma.pros.findUnique({
      where: {
        id: prosId,
      },
    });

    if (!existingPros) {
      throw new BadRequestException("Pros not found");
    }

    // Check pros name is unique
    const prosName = await prisma.pros.findFirst({
      where: {
        name,
        NOT: {
          id: prosId,
        },
      },
    });

    if (prosName) {
      throw new ValidationException("Failed to updated pros", [
        {
          field: "name",
          issue: "Name is already existed",
        },
      ]);
    }

    // Update pros
    await prisma.pros.update({
      where: {
        id: prosId,
      },
      data: {
        name: name ?? existingPros.name,
        guard: name ? toKebabCase(name) : existingPros.guard,
        status: updateProsInput.status ?? existingPros.status,
        updatedBy: { connect: { id: userId } },
      },
    });

    return this.findOne(prosId);
  }

  async destroy(id: number) {
    await this.findOne(id);

    await prisma.pros.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }
}

export default ProsService;
