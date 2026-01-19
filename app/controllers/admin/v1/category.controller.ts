import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import CategoryService from "../../../services/admin/v1/category.service";
import {
  createCategorySchema,
  updateCategroySchema,
} from "../../../schemas/admin/v1/category.schema";
import { CategoryCollection } from "../../../resources/admin/v1/category/category.collection";
import { CategoryResource } from "../../../resources/admin/v1/category/category.resource";
import { categoryScope } from "../../../scopes/admin/v1/category.scope";

class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = categoryScope(req.query);

    if (page && perPage) {
      const categories = await this.categoryService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Category successfully",
        CategoryCollection.withPagination(categories)
      );
    }

    const categories = await this.categoryService.findAll(where);

    return successResponse(
      res,
      "Category successfully",
      CategoryCollection.toCollection(categories)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = categoryScope(req.query);

    const categories = await this.categoryService.findCommonAll(where);
    
    return successResponse(
      res,
      "Category list successfully",
      CategoryCollection.toCommonCollection(categories)
    );
  }

  async findOne(req: Request, res: Response) {
    const category = await this.categoryService.findOne(+req.params.id);

    return successResponse(
      res,
      "Category detail successfully",
      CategoryResource.toResource(category)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createCategorySchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Category created failed", error);
    }

    const category = await this.categoryService.create(data);

    return successResponse(
      res,
      "Category created successfully",
      CategoryResource.toResource(category)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateCategroySchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Category updated failed", error);
    }

    const category = await this.categoryService.update(+req.params.id, data);

    return successResponse(
      res,
      "Category updated successfully",
      CategoryResource.toResource(category)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.categoryService.destroy(+req.params.id);
    return successResponse(res, "Category deleted successfully");
  }
}

export default CategoryController;
