import { Request, Response } from "express";
import TagService from "../../../services/admin/v1/tag.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createTagSchema,
  updateTagSchema,
} from "../../../schemas/admin/v1/tag.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { TagCollection } from "../../../resources/admin/v1/tag/tag.collection";
import { TagResource } from "../../../resources/admin/v1/tag/tag.resource";
import { Prisma, Status } from "@prisma/client";

class TagController {
  private tagService: TagService;

  constructor() {
    this.tagService = new TagService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name, status } = req.query;

    let where: Prisma.TagWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    if (status) {
      where.status = status as Status;
    }

    if (page && perPage) {
      const tags = await this.tagService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Tag list successfully",
        TagCollection.withPagination(tags)
      );
    }

    const tags = await this.tagService.findAll(where);
    return successResponse(
      res,
      "Tag list successfully",
      TagCollection.toCollection(tags)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { name } = req.query;

    let where: Prisma.TagWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    const tags = await this.tagService.findCommonAll(where);
    
    return successResponse(
      res,
      "Tag list successfully",
      TagCollection.toCommonCollection(tags)
    );
  }

  async findOne(req: Request, res: Response) {
    const tag = await this.tagService.findOne(+req.params.id);
    return successResponse(
      res,
      "Tag details successfully",
      TagResource.toResource(tag)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createTagSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create tag", error);
    }

    const userId = (req.user as any)?.id;
    const tag = await this.tagService.create(data, userId);
    return successResponse(
      res,
      "Tag created successfully",
      TagResource.toResource(tag)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateTagSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update tag", error);
    }

    const userId = (req.user as any)?.id;
    const tag = await this.tagService.update(+req.params.id, data, userId);
    return successResponse(
      res,
      "Tag updated successfully",
      TagResource.toResource(tag)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.tagService.destroy(+req.params.id);
    return successResponse(res, "Tag deleted successfully");
  }
}

export default TagController;

