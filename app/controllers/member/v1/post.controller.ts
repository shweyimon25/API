import { Request, Response } from "express";
import PostService from "../../../services/member/v1/post.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createPostSchema,
  updatePostSchema,
} from "../../../schemas/member/v1/post.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { PostCollection } from "../../../resources/member/v1/post/post.collection";
import { PostResource } from "../../../resources/member/v1/post/post.resource";

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const posts = await this.postService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Post list successfully",
        PostCollection.withPagination(posts)
      );
    }

    const posts = await this.postService.findAll();
    return successResponse(
      res,
      "Post list successfully",
      PostCollection.toCollection(posts)
    );
  }

  async findOne(req: Request, res: Response) {
    const post = await this.postService.findOne(+req.params.id);
    return successResponse(
      res,
      "Post details successfully",
      PostResource.toResource(post)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(createPostSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to create post", error);
    }

    const post = await this.postService.create(data);
    return successResponse(
      res,
      "Post created successfully",
      PostResource.toResource(post)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(updatePostSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to update post", error);
    }

    const post = await this.postService.update(+req.params.id, data);
    return successResponse(
      res,
      "Post updated successfully",
      PostResource.toResource(post)
    );
  }

  async destroy(req: Request, res: Response) {
    const post = await this.postService.destroy(+req.params.id);
    return successResponse(
      res,
      "Post deleted successfully",
      PostResource.toResource(post)
    );
  }
}

export default PostController;