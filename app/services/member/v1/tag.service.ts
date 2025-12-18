import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { Status } from "@prisma/client";

class TagService {
  async findAll() {
    const tags = await prisma.tag.findMany({
      where: {
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return tags;
  }

  async findByPaginate(page: number, perPage: number) {
    const tags = await prisma.tag.findMany({
      where: {
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    const totalTags = await prisma.tag.count({
      where: {
        status: Status.ACTIVE,
      },
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
        status: Status.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
}

export default TagService;

