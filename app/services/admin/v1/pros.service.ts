import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import { generateSlug, toKebabCase } from "../../../helpers/helper";
import {
  CreateProsInput,
  UpdateProsInput,
} from "../../../schemas/admin/v1/pros.schema";
import { Status } from "@prisma/client";

class ProsService {
  async findAll() {
    const pros = await prisma.pros.findMany({
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

    return pros;
  }

  async findByPaginate(page: number, perPage: number) {
    const pros = await prisma.pros.findMany({
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

    const totalPros = await prisma.pros.count();

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

    if (!pros) {
      throw new BadRequestException("Pros not found");
    }

    return pros;
  }

  async create(createProsInput: CreateProsInput) {
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
      },
    });

    return this.findOne(pros.id);
  }

  async update(prosId: number, updateProsInput: UpdateProsInput) {
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
      },
    });

    return this.findOne(prosId);
  }

  async destroy(id: number) {
    const pros = await this.findOne(id);

    await prisma.pros.delete({
      where: {
        id,
      },
    });

    return pros;
  }
}

export default ProsService;
