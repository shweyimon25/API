import {
  CreatePostCategoryInput,
  UpdatePostCategoryInput,
} from "../../../schemas/admin/v1/post-category.schema";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import { Prisma, Status } from "@prisma/client";

class PostCategoryService {
  async findAll(where?: Prisma.PostCategoryWhereInput) {
    const postCategories = await prisma.postCategory.findMany({
      where,
      orderBy: {
        id: "desc",
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
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalPostCategories = await prisma.postCategory.count({
      where,
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
    const postCategory = await prisma.postCategory.findFirst({
      where: {
        id,
      },
    });

    if (!postCategory) {
      throw new NotFoundException("Post category not found");
    }

    return postCategory;
  }

  async findCommonAll(where?: Prisma.PostCategoryWhereInput) {
    const postCategories = await prisma.postCategory.findMany({
      where: {
        ...where,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return postCategories;
  }

  async create(
    createPostCategoryInput: CreatePostCategoryInput,
    userId: number,
  ) {
    const { name } = createPostCategoryInput;

    // Check if post category name already exists
    const existingPostCategory = await prisma.postCategory.findFirst({
      where: {
        name,
      },
    });

    if (existingPostCategory) {
      throw new ValidationException("Failed to create post category", [
        {
          field: "name",
          issue: "Post category name already exists",
        },
      ]);
    }

    // Create new post category
    const postCategory = await prisma.postCategory.create({
      data: {
        name,
      },
    });

    return this.findOne(postCategory.id);
  }

  async update(
    id: number,
    updatePostCategoryInput: UpdatePostCategoryInput,
    userId: number,
  ) {
    const { name } = updatePostCategoryInput;

    // Check post category exists
    const existingPostCategory = await prisma.postCategory.findFirst({
      where: {
        id,
      },
    });

    if (!existingPostCategory) {
      throw new BadRequestException("Post category not found");
    }

    // Check if post category name already exists (if name is being updated)
    if (name && name !== existingPostCategory.name) {
      const postCategoryWithName = await prisma.postCategory.findFirst({
        where: {
          name,
        },
      });

      if (postCategoryWithName) {
        throw new ValidationException("Failed to update post category", [
          {
            field: "name",
            issue: "Post category name already exists",
          },
        ]);
      }
    }

    // Update post category
    await prisma.postCategory.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingPostCategory.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const postCategory = await this.findOne(id);

    await prisma.postCategory.delete({
      where: { id },
    });

    return postCategory;
  }
}

export default PostCategoryService;
