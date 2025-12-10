import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../../schemas/admin/v1/category.schema";

class CategoryService {
  async findAll() {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return categories;
  }

  async findByPaginate(page: number, perPage: number) {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalCategory = await prisma.category.count();

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
    const category = await prisma.category.create({
      data: {
        ...createCategoryInput,
      },
    });

    return this.findOne(category.id);
  }

  async update(id: number, updateCategoryInput: UpdateCategoryInput) {
    const { name } = updateCategoryInput;

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
        name: name || existingCategory.name,
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
