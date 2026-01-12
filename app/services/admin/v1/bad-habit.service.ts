import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
import {
  CreateBadHabitInput,
  UpdateBadHabitInput,
} from "../../../schemas/admin/v1/bad-habit.schema";
import { Prisma, Status } from "@prisma/client";

class BadHabitService {
  async findAll(where?: Prisma.BadHabitWhereInput) {
    const badHabits = await prisma.badHabit.findMany({
      where,
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

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.BadHabitWhereInput
  ) {
    const badHabits = await prisma.badHabit.findMany({
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
      where,
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

  async findCommonAll(where?: Prisma.BadHabitWhereInput) {
    const badHabits = await prisma.badHabit.findMany({
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

    return badHabits;
  }

  async create(
    createBadHabitInput: CreateBadHabitInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = createBadHabitInput;

    let photo: string | null = null;

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === "photo") {
          const { fileUrl } = await upload(file, "bad-habit");
          photo = fileUrl;
          break;
        }
      }
    }

    if (!photo) {
      throw new ValidationException("Failed to create bad habit", [
        {
          field: "photo",
          issue: "Photo is required",
        },
      ]);
    }

    const badHabit = await prisma.badHabit.create({
      data: {
        name,
        description,
        photo,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(badHabit.id);
  }

  async update(
    id: number,
    updateBadHabitInput: UpdateBadHabitInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = updateBadHabitInput;

    const existingBadHabit = await this.findOne(id);

    let photo: string | null = null;

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === "photo") {
          const { fileUrl } = await upload(file, "bad-habit");
          photo = fileUrl;
          break;
        }
      }
    }

    await prisma.badHabit.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingBadHabit.name,
        description: description ?? existingBadHabit.description,
        photo: photo ?? existingBadHabit.photo,
        status: status ?? existingBadHabit.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const badHabit = await this.findOne(id);

    await prisma.badHabit.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return badHabit;
  }
}

export default BadHabitService;
