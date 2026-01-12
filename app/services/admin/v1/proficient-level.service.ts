import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  NotFoundException,
} from "../../../helpers/exceptions";
import {
  CreateProficientLevelInput,
  UpdateProficientLevelInput,
} from "../../../schemas/admin/v1/proficient-level.schema";
import { Prisma, Status } from "@prisma/client";

class ProficientLevelService {
  async findAll(where?: Prisma.ProficientLevelWhereInput) {
    const proficientLevels = await prisma.proficientLevel.findMany({
      where,
      orderBy: {
        id: "desc",
      },
    });

    return proficientLevels;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.ProficientLevelWhereInput) {
    const proficientLevel = await prisma.proficientLevel.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalProficientLevel = await prisma.proficientLevel.count({
      where,
    });

    return {
      data: proficientLevel,
      meta: {
        totalCount: totalProficientLevel,
        totalPages: Math.ceil(totalProficientLevel / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalProficientLevel / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalProficientLevel / perPage),
      },
    };
  }

  async findOne(id: number) {
    const proficientLevel = await prisma.proficientLevel.findUnique({
      where: {
        id,
      },
    });

    if (!proficientLevel) {
      throw new BadRequestException("Proficient level not found");
    }

    return proficientLevel;
  }

  async findCommonAll(where?: Prisma.ProficientLevelWhereInput) {
    const proficientLevels = await prisma.proficientLevel.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
        deletedAt: null,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return proficientLevels;
  }

  async create(createProficientLevelInput: CreateProficientLevelInput) {
    const { name, status } = createProficientLevelInput;
    const proficientLevel = await prisma.proficientLevel.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
      },
    });

    return this.findOne(proficientLevel.id);
  }

  async update(id: number, updateProficientInput: UpdateProficientLevelInput) {
    const { name, status } = updateProficientInput;

    const existingProficientLevel = await prisma.proficientLevel.findUnique({
      where: {
        id,
      },
    });

    if (!existingProficientLevel) {
      throw new NotFoundException("Proficient level not found");
    }

    await prisma.proficientLevel.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingProficientLevel.name,
        status: status ?? existingProficientLevel.status,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const proficientLevel = await this.findOne(id);

    await prisma.proficientLevel.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return proficientLevel;
  }
}

export default ProficientLevelService;
