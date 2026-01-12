import {
  CreateTagInput,
  UpdateTagInput,
} from "./../../../schemas/admin/v1/tag.schema";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ValidationException,
} from "../../../helpers/exceptions";
import { Prisma, Status } from "@prisma/client";

class TagService {
  async findAll(where?: Prisma.TagWhereInput) {
    const tags = await prisma.tag.findMany({
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
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return tags;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.TagWhereInput) {
    const tags = await prisma.tag.findMany({
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
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    const totalTags = await prisma.tag.count({
      where,
    });

    return {
      data: tags,
      meta: {
        totalCount: totalTags,
        totalPages: Math.ceil(totalTags / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalTags / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalTags / perPage),
      },
    };
  }

  async findOne(id: number) {
    const tag = await prisma.tag.findUnique({
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
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!tag) {
      throw new BadRequestException("Tag not found");
    }

    return tag;
  }

  async findCommonAll(where?: Prisma.TagWhereInput) {
    const tags = await prisma.tag.findMany({
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

    return tags;
  }

  async create(createTagInput: CreateTagInput, userId: number) {
    const { name, status } = createTagInput;

    // Check if tag name already exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (existingTag) {
      throw new ValidationException("Failed to create tag", [
        {
          field: "name",
          issue: "Tag name already exists",
        },
      ]);
    }

    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(tag.id);
  }

  async update(id: number, updateTagInput: UpdateTagInput, userId: number) {
    const { name, status } = updateTagInput;

    // Check tag exists
    const existingTag = await prisma.tag.findUnique({
      where: {
        id,
      },
    });

    if (!existingTag) {
      throw new BadRequestException("Tag not found");
    }

    // Check if tag name already exists (if name is being updated)
    if (name && name !== existingTag.name) {
      const tagWithName = await prisma.tag.findUnique({
        where: {
          name,
        },
      });

      if (tagWithName) {
        throw new ValidationException("Failed to update tag", [
          {
            field: "name",
            issue: "Tag name already exists",
          },
        ]);
      }
    }

    // Update tag
    await prisma.tag.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingTag.name,
        status: status ?? existingTag.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    // Find tag
    const tag = await this.findOne(id);

    // Delete tag
    await prisma.tag.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return tag;
  }
}

export default TagService;

