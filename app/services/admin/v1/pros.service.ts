import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import { generateSlug } from "../../../helpers/helper";
import {
  CreateProsInput,
  UpdateProsInput,
} from "../../../schemas/admin/v1/pros.schema";

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
    const pros = await prisma.pros.findUnique({
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
    const { name } = createProsInput;
    const guard = await generateSlug(name, "Pros");

    // Check guard is unique
    const existingGuard = await prisma.pros.findFirst({
      where: {
        guard,
      },
    });

    if (existingGuard) {
      throw new ValidationException("Failed to create pros", [
        {
          field: "guard",
          issue: "Guard is already existed",
        },
      ]);
    }

    // Create pros
    const pros = await prisma.pros.create({
      data: {
        name,
        guard,
      },
    });

    return this.findOne(pros.id);
  }

  async update(id: number, updateProsInput: UpdateProsInput) {
    const { name } = updateProsInput;

    // Check pros exists
    const existingPros = await prisma.pros.findUnique({
      where: {
        id,
      },
    });

    if (!existingPros) {
      throw new BadRequestException("Pros not found");
    }

    // Check guard is unique if provided
    if (guard) {
      const existingGuard = await prisma.pros.findFirst({
        where: {
          guard,
          NOT: {
            id,
          },
        },
      });

      if (existingGuard) {
        throw new ValidationException("Failed to update pros", [
          {
            field: "guard",
            issue: "Guard is already existed",
          },
        ]);
      }
    }

    // Update pros
    await prisma.pros.update({
      where: {
        id,
      },
      data: {
        name: name || existingPros.name,
        guard: guard || existingPros.guard,
      },
    });

    return this.findOne(id);
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
