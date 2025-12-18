import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import {
  CreateBadHabitInput,
  UpdateBadHabitInput,
} from "../../../schemas/admin/v1/bad-habit.schema";
import { Status } from "@prisma/client";

interface BadHabitFilters {
  status?: Status;
  search?: string;
}

class BadHabitService {
  private where(filters?: BadHabitFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.description = {
        contains: filters.search,
      };
    }

    return where;
  }

  async findAll(filters?: BadHabitFilters) {
    const badHabits = await prisma.badHabit.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    return badHabits;
  }

  async findByPaginate(page: number, perPage: number, filters?: BadHabitFilters) {
    const badHabits = await prisma.badHabit.findMany({
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
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    const totalCount = await prisma.badHabit.count({
      where: this.where(filters),
    });

    return {
      data: badHabits,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCount / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCount / perPage),
      },
    };
  }

  async findOne(id: number) {
    const badHabit = await prisma.badHabit.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!badHabit) {
      throw new NotFoundException("Bad habit not found");
    }

    return badHabit;
  }

  async create(createBadHabitInput: CreateBadHabitInput, userId: number) {
    const { description, photo, status } = createBadHabitInput;

    const badHabit = await prisma.badHabit.create({
      data: {
        description,
        photo: photo || null,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(badHabit.id);
  }

  async update(id: number, updateBadHabitInput: UpdateBadHabitInput, userId: number) {
    const { description, photo, status } = updateBadHabitInput;

    const existing = await this.findOne(id);

    await prisma.badHabit.update({
      where: {
        id,
      },
      data: {
        description: description ?? existing.description,
        photo: photo !== undefined ? (photo || null) : existing.photo,
        status: status ?? existing.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const badHabit = await this.findOne(id);

    await prisma.badHabit.delete({
      where: {
        id,
      },
    });

    return badHabit;
  }
}

export default BadHabitService;

