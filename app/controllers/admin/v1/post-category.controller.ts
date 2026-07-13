import { Request, Response } from "express";
import TagService from "../../../services/admin/v1/post-category.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createPostCategorySchema,
  updatePostCategorySchema,
} from "../../../schemas/admin/v1/post-category.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { TagCollection } from "../../../resources/admin/v1/tag/tag.collection";
import { TagResource } from "../../../resources/admin/v1/tag/tag.resource";
import { tagScope } from "../../../scopes/admin/v1/post-category.scope";

class PostCategoryController {
  private postCategoryService: TagService;

  constructor() {
    this.postCategoryService = new TagService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = tagScope(req.query);

    if (page && perPage) {
      const tags = await this.postCategoryService.findByPaginate(
        +page,
        +perPage,
        where,
      );
      return successResponse(
        res,
        "Post category list successfully",
        TagCollection.withPagination(tags),
      );
    }

    const tags = await this.postCategoryService.findAll(where);
    return successResponse(
      res,
      "Post category list successfully",
      TagCollection.toCollection(tags),
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = tagScope(req.query);

    const tags = await this.postCategoryService.findCommonAll(where);

    return successResponse(
      res,
      "Post category list successfully",
      TagCollection.toCommonCollection(tags),
    );
  }

  async findOne(req: Request, res: Response) {
    const tag = await this.postCategoryService.findOne(+req.params.id);
    return successResponse(
      res,
      "Post category details successfully",
      TagResource.toResource(tag),
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(
      createPostCategorySchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Failed to create post category", error);
    }

    const userId = (req.user as any)?.id;
    const tag = await this.postCategoryService.create(data, userId);
    return successResponse(
      res,
      "Post category created successfully",
      TagResource.toResource(tag),
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(
      updatePostCategorySchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Failed to update post category", error);
    }

    const userId = (req.user as any)?.id;
    const tag = await this.postCategoryService.update(
      +req.params.id,
      data,
      userId,
    );
    return successResponse(
      res,
      "Post category updated successfully",
      TagResource.toResource(tag),
    );
  }

  async destroy(req: Request, res: Response) {
    await this.postCategoryService.destroy(+req.params.id);
    return successResponse(res, "Post category deleted successfully");
  }
}

export default PostCategoryController;
