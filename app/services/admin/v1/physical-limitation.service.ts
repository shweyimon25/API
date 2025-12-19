import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
import {
  CreatePhysicalLimitationInput,
  UpdatePhysicalLimitationInput,
} from "../../../schemas/admin/v1/physical-limitation.schema";
import { Status } from "@prisma/client";

interface PhysicalLimitationFilters {
  status?: Status;
  search?: string;
}

class PhysicalLimitationService {
  private where(filters?: PhysicalLimitationFilters) {
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

  async findAll(filters?: PhysicalLimitationFilters) {
    const physicalLimitations = await prisma.physicalLimitation.findMany({
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

    return physicalLimitations;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    filters?: PhysicalLimitationFilters
  ) {
    const physicalLimitations = await prisma.physicalLimitation.findMany({
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

    const totalCount = await prisma.physicalLimitation.count({
      where: this.where(filters),
    });

    return {
      data: physicalLimitations,
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
    const physicalLimitation = await prisma.physicalLimitation.findUnique({
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

    if (!physicalLimitation) {
      throw new NotFoundException("Physical limitation not found");
    }

    return physicalLimitation;
  }

  async create(
    createPhysicalLimitationInput: CreatePhysicalLimitationInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = createPhysicalLimitationInput;

    // Check if name already exists
    const existingPhysicalLimitation =
      await prisma.physicalLimitation.findUnique({
        where: {
          name,
        },
      });

    if (existingPhysicalLimitation) {
      throw new ValidationException("Failed to create physical limitation", [
        {
          field: "name",
          issue: "Name already exists",
        },
      ]);
    }

    // Upload photo
    let photo: string | null = null;

    files.forEach(async (file: Express.Multer.File) => {
      if (file.fieldname === "photo") {
        const { fileUrl } = await upload(file, "physical-limitation");
        photo = fileUrl;
      }
    });

    // Check if photo is provided
    if (!photo) {
      throw new ValidationException("Failed to create physical limitation", [
        {
          field: "photo",
          issue: "Photo is required",
        },
      ]);
    }

    const physicalLimitation = await prisma.physicalLimitation.create({
      data: {
        name,
        photo,
        description: description || null,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(physicalLimitation.id);
  }

  async update(
    id: number,
    updatePhysicalLimitationInput: UpdatePhysicalLimitationInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = updatePhysicalLimitationInput;

    const existingPhysicalLimitation = await this.findOne(id);

    // Check if name already exists (if name is being updated)
    if (name && name !== existingPhysicalLimitation.name) {
      const nameExists = await prisma.physicalLimitation.findUnique({
        where: {
          name,
        },
      });

      if (nameExists) {
        throw new ValidationException("Failed to update physical limitation", [
          {
            field: "name",
            issue: "Name already exists",
          },
        ]);
      }
    }

    let photo: string | null = null;

    if (files && files.length > 0) {
      files.forEach(async (file: Express.Multer.File) => {
        if (file.fieldname === "photo") {
          const { fileUrl } = await upload(file, "physical-limitation");
          photo = fileUrl;
        }
      });
    }

    await prisma.physicalLimitation.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingPhysicalLimitation.name,
        photo: photo ?? existingPhysicalLimitation.photo,
        description: description ?? existingPhysicalLimitation.description,
        status: status ?? existingPhysicalLimitation.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const physicalLimitation = await this.findOne(id);

    await prisma.physicalLimitation.delete({
      where: {
        id,
      },
    });

    return physicalLimitation;
  }
}

export default PhysicalLimitationService;
