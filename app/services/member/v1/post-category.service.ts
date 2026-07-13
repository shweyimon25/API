import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";

class PostCategoryService {
  async findAll(where?: Prisma.PostCategoryWhereInput) {
    const postCategories = await prisma.postCategory.findMany({
      where: where,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    return postCategories;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.PostCategoryWhereInput,
  ) {
    const postCategories = await prisma.postCategory.findMany({
      where: where,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    const totalPostCategories = await prisma.postCategory.count({
      where: where,
    });

    return {
      data: postCategories,
      meta: {
        totalCount: totalPostCategories,
        totalPages: Math.ceil(totalPostCategories / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalPostCategories / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalPostCategories / perPage),
      },
    };
  }

  async findOne(id: number) {
    const postCategory = await prisma.postCategory.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!postCategory) {
      throw new BadRequestException("Post category not found");
    }

    return postCategory;
  }
}

export default PostCategoryService;
