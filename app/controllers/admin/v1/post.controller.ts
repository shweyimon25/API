import { Request, Response } from "express";
import PostService from "../../../services/admin/v1/post.service";
import { successResponse } from "../../../helpers/response";
import { PostCollection } from "../../../resources/admin/v1/post/post.collection";
import { PostResource } from "../../../resources/admin/v1/post/post.resource";

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
}

export default PostController;

