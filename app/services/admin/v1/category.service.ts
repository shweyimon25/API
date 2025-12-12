import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../../schemas/admin/v1/category.schema";
import { Status } from "@prisma/client";

interface CategoryFilters {
  status?: Status;
  search?: string;
}

class CategoryService {
  private where(filters?: CategoryFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
      };
    }

    return where;
  }

  async findAll(filters?: CategoryFilters) {
    const categories = await prisma.category.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
    });

    return categories;
  }

  async findByPaginate(page: number, perPage: number, filters?: CategoryFilters) {
    const categories = await prisma.category.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalCategory = await prisma.category.count({
      where: this.where(filters),
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
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
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
      where: {
        id,
      },
    });

    return category;
  }
}

export default CategoryService;
