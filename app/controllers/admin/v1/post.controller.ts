import { Request, Response } from "express";
import PostService from "../../../services/admin/v1/post.service";
import { successResponse } from "../../../helpers/response";
import { PostCollection } from "../../../resources/admin/v1/post/post.collection";
import { PostResource } from "../../../resources/admin/v1/post/post.resource";
import { postScope } from "../../../scopes/admin/v1/post.scope";
class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = postScope(req.query);

    if (page && perPage) {
      const posts = await this.postService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Post list successfully",
        PostCollection.withPagination(posts)
      );
    }

    const posts = await this.postService.findAll(where);
    return successResponse(
      res,
      "Post list successfully",
      PostCollection.toCollection(posts)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const post = await this.postService.findOne(+id);

    return successResponse(
      res,
      "Post details successfully",
      PostResource.toResource(post)
    );
  }
}

export default PostController;

