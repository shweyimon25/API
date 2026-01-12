import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateBodyAttentionAreaInput,
  UpdateBodyAttentionAreaInput,
} from "../../../schemas/admin/v1/body-attention-area.schema";
import { Prisma, Status } from "@prisma/client";

class BodyAttentionAreaService {
  async findAll(where?: Prisma.BodyAttentionAreaWhereInput) {
    const bodyAttentionAreas = await prisma.bodyAttentionArea.findMany({
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

    return bodyAttentionAreas;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.BodyAttentionAreaWhereInput
  ) {
    const bodyAttentionAreas = await prisma.bodyAttentionArea.findMany({
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

    const totalCount = await prisma.bodyAttentionArea.count({
      where,
    });

    return {
      data: bodyAttentionAreas,
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
    const bodyAttentionArea = await prisma.bodyAttentionArea.findUnique({
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

    if (!bodyAttentionArea) {
      throw new NotFoundException("Body attention area not found");
    }

    return bodyAttentionArea;
  }

  async findCommonAll(where?: Prisma.BodyAttentionAreaWhereInput) {
    const bodyAttentionAreas = await prisma.bodyAttentionArea.findMany({
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

    return bodyAttentionAreas;
  }

  async create(
    createBodyAttentionAreaInput: CreateBodyAttentionAreaInput,
    userId: number
  ) {
    const { name, status } = createBodyAttentionAreaInput;

    const existingBodyAttentionAreaName =
      await prisma.bodyAttentionArea.findUnique({
        where: {
          name,
        },
      });

    if (existingBodyAttentionAreaName) {
      throw new ValidationException("Failed to create body attention area", [
        {
          field: "name",
          issue: "Name already exists",
        },
      ]);
    }

    const bodyAttentionArea = await prisma.bodyAttentionArea.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(bodyAttentionArea.id);
  }

  async update(
    id: number,
    updateBodyAttentionAreaInput: UpdateBodyAttentionAreaInput,
    userId: number
  ) {
    const { name, status } = updateBodyAttentionAreaInput;

    const existingBodyAttentionArea = await this.findOne(id);

    if (name && name !== existingBodyAttentionArea.name) {
      const existingBodyAttentionAreaName =
        await prisma.bodyAttentionArea.findUnique({
          where: {
            name,
          },
        });

      if (existingBodyAttentionAreaName) {
        throw new ValidationException("Failed to update body attention area", [
          {
            field: "name",
            issue: "Name already exists",
          },
        ]);
      }
    }

    await prisma.bodyAttentionArea.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingBodyAttentionArea.name,
        status: status ?? existingBodyAttentionArea.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const bodyAttentionArea = await this.findOne(id);

    await prisma.bodyAttentionArea.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return bodyAttentionArea;
  }
}

export default BodyAttentionAreaService;
