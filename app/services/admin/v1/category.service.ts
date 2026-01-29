import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../../schemas/admin/v1/category.schema";
import { Prisma, Status } from "@prisma/client";

class CategoryService {
  async findAll(where?: Prisma.CategoryWhereInput) {
    const categories = await prisma.category.findMany({
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

    return categories;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.CategoryWhereInput) {
    const categories = await prisma.category.findMany({
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

    const totalCategory = await prisma.category.count({
      where,
    });

    return {
      data: categories,
      meta: {
        totalCount: totalCategory,
        totalPages: Math.ceil(totalCategory / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCategory / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCategory / perPage),
      },
    };
  }

  async findOne(id: number) {
    const category = await prisma.category.findUnique({
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

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async findCommonAll(where?: Prisma.CategoryWhereInput) {
    const categories = await prisma.category.findMany({
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

    return categories;
  }

  async create(createCategoryInput: CreateCategoryInput) {
    const { name, status } = createCategoryInput;
    const category = await prisma.category.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
      },
    });

    return this.findOne(category.id);
  }

  async update(id: number, updateCategoryInput: UpdateCategoryInput) {
    const { name, status } = updateCategoryInput;

    // Check category exists
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      throw new NotFoundException("Category not found");
    }

    await prisma.category.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingCategory.name,
        status: status ?? existingCategory.status,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const category = await this.findOne(id);

    await prisma.category.delete({
      where: { id },
    });

    return category;
  }
}

export default CategoryService;
