import { Request, Response } from "express";
import TagService from "../../../services/member/v1/tag.service";
import { successResponse } from "../../../helpers/response";
import { TagCollection } from "../../../resources/member/v1/tag/tag.collection";
import { TagResource } from "../../../resources/member/v1/tag/tag.resource";

class TagController {
  private tagService: TagService;

  constructor() {
    this.tagService = new TagService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const tags = await this.tagService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Tag list successfully",
        TagCollection.withPagination(tags)
      );
    }

    const tags = await this.tagService.findAll();
    return successResponse(
      res,
      "Tag list successfully",
      TagCollection.toCollection(tags)
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
}

export default TagController;

