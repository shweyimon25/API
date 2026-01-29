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
import { Prisma, Status } from "@prisma/client";

class PhysicalLimitationService {
  async findAll(where?: Prisma.PhysicalLimitationWhereInput) {
    const physicalLimitations = await prisma.physicalLimitation.findMany({
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

    return physicalLimitations;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.PhysicalLimitationWhereInput
  ) {
    const physicalLimitations = await prisma.physicalLimitation.findMany({
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

    const totalCount = await prisma.physicalLimitation.count({
      where,
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

  async findCommonAll(where?: Prisma.PhysicalLimitationWhereInput) {
    const physicalLimitations = await prisma.physicalLimitation.findMany({
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

    return physicalLimitations;
  }

  async create(
    createPhysicalLimitationInput: CreatePhysicalLimitationInput,
    userId: number,
    files: Express.Multer.File[]
  ) {
    const { name, description, status } = createPhysicalLimitationInput;

    const existingPhysicalLimitation =
      await prisma.physicalLimitation.findFirst({
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

    let photo: string | null = null;
    const photoFile = files.find((file: Express.Multer.File) => file.fieldname === "photo");

    if (photoFile) {
      const { fileUrl } = await upload(photoFile, "physical-limitation");
      photo = fileUrl;
    }

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

    if (name && name !== existingPhysicalLimitation.name) {
      const nameExists = await prisma.physicalLimitation.findFirst({
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
    const photoFile = files.find((file: Express.Multer.File) => file.fieldname === "photo");

    if (photoFile) {
      const { fileUrl } = await upload(photoFile, "physical-limitation");
      photo = fileUrl;
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
      where: { id },
    });

    return physicalLimitation;
  }
}

export default PhysicalLimitationService;
