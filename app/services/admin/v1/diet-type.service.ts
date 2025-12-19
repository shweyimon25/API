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
import { Status } from "@prisma/client";

interface DietTypeFilters {
  status?: Status;
  search?: string;
}

class DietTypeService {
  private where(filters?: DietTypeFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
          },
        },
        {
          description: {
            contains: filters.search,
          },
        },
      ];
    }

    return where;
  }

  async findAll(filters?: DietTypeFilters) {
    const dietTypes = await prisma.dietType.findMany({
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

    return dietTypes;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    filters?: DietTypeFilters
  ) {
    const dietTypes = await prisma.dietType.findMany({
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

    const totalCount = await prisma.dietType.count({
      where: this.where(filters),
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
    const dietType = await prisma.dietType.findUnique({
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

  async create(
    createDietTypeInput: CreateDietTypeInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = createDietTypeInput;

    const existingDietType = await prisma.dietType.findUnique({
      where: {
        name,
      },
    });

    if (existingDietType) {
      throw new ValidationException("Failed to create diet type", [
        {
          field: "name",
          issue: "Name already exists",
        },
      ]);
    }

    let photo: string | null = null;

    for (const file of files) {
      if (file.fieldname === "photo") {
        const { fileUrl } = await upload(file, "diet-type");
        photo = fileUrl;
        break;
      }
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
        updatedById: userId,
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
      const nameExists = await prisma.dietType.findUnique({
        where: {
          name,
        },
      });

      if (nameExists) {
        throw new ValidationException("Failed to update diet type", [
          {
            field: "name",
            issue: "Name already exists",
          },
        ]);
      }
    }

    let photo: string | null = null;

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fieldname === "photo") {
          const { fileUrl } = await upload(file, "diet-type");
          photo = fileUrl;
          break;
        }
      }
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
      where: {
        id,
      },
    });

    return dietType;
  }
}

export default DietTypeService;
