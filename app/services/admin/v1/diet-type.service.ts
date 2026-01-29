import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
import {
  CreateDietTypeInput,
  UpdateDietTypeInput,
} from "../../../schemas/admin/v1/diet-type.schema";
import { Prisma, Status } from "@prisma/client";

class DietTypeService {
  async findAll(where?: Prisma.DietTypeWhereInput) {
    const dietTypes = await prisma.dietType.findMany({
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

    return dietTypes;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.DietTypeWhereInput
  ) {
    const dietTypes = await prisma.dietType.findMany({
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

    const totalCount = await prisma.dietType.count({
      where,
    });

    return {
      data: dietTypes,
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
    const dietType = await prisma.dietType.findFirst({
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

    if (!dietType) {
      throw new NotFoundException("Diet type not found");
    }

    return dietType;
  }

  async findCommonAll(where?: Prisma.DietTypeWhereInput) {
    const dietTypes = await prisma.dietType.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return dietTypes;
  }

  async create(
    createDietTypeInput: CreateDietTypeInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = createDietTypeInput;

    if (name) {
      const existingName = await prisma.dietType.findFirst({
        where: {
          name,
          status: Status.ACTIVE,
        },
      });

      if (existingName) {
        throw new ValidationException("Failed to create diet type", [
          {
            field: "name",
            issue: "Name already exists",
          },
        ]);
      }
    }

    let photo: string | null = null;
    const photoFile = files.find((file: Express.Multer.File) => file.fieldname === "photo");

    if (photoFile) {
      const { fileUrl } = await upload(photoFile, "diet-type");
      photo = fileUrl;
    }

    if (!photo) {
      throw new ValidationException("Failed to create diet type", [
        {
          field: "photo",
          issue: "Photo is required",
        },
      ]);
    }

    const dietType = await prisma.dietType.create({
      data: {
        name,
        photo,
        description: description || null,
        status: status ?? Status.ACTIVE,
        createdById: userId,
      },
    });

    return this.findOne(dietType.id);
  }

  async update(
    id: number,
    updateDietTypeInput: UpdateDietTypeInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = updateDietTypeInput;

    const existingDietType = await this.findOne(id);

    if (name && name !== existingDietType.name) {
      const existingName = await prisma.dietType.findFirst({
        where: {
          name,
          status: Status.ACTIVE,
          NOT: {
            id,
          },
        },
      });

      if (existingName) {
        throw new ValidationException("Failed to update diet type", [
          {
            field: "name",
            issue: "Name already exists",
          },
        ]);
      }
    }

    let photo: string | null = null;

    const photoFile = files.find((file: Express.Multer.File) => file.fieldname === "photo");
    if (photoFile) {
      const { fileUrl } = await upload(photoFile, "diet-type");
      photo = fileUrl;
    }

    await prisma.dietType.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingDietType.name,
        photo: photo ?? existingDietType.photo,
        description: description ?? existingDietType.description,
        status: status ?? existingDietType.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const dietType = await this.findOne(id);

    await prisma.dietType.delete({
      where: { id },
    });

    return dietType;
  }
}

export default DietTypeService;
