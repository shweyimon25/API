import { Request, Response } from "express";
import { Member } from "@prisma/client";
import PostCommentService from "../../../services/member/v1/post-comment.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import {
  createPostCommentSchema,
  updatePostCommentSchema,
} from "../../../schemas/member/v1/post-comment.schema";
import { PostCommentResource } from "../../../resources/member/v1/post-comment/post-comment.resource";

class PostCommentController {
  private postCommentService: PostCommentService;

  constructor() {
    this.postCommentService = new PostCommentService();
  }

  async findAll(req: Request, res: Response) {
    const { postId } = req.query;
    if (postId == null || postId === "") {
      throw new ValidationException("Failed to list post comments", [
        { field: "postId", issue: "Post ID is required" },
      ]);
    }
    const comments = await this.postCommentService.listByPostId(+postId);
    return successResponse(res, "Post comments list successfully", comments);
  }

  async findOne(req: Request, res: Response) {
    const comment = await this.postCommentService.findOne(+req.params.id);
    return successResponse(
      res,
      "Post comment fetched successfully",
      PostCommentResource.toResource(comment)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(
      createPostCommentSchema,
      req.body
    );
    if (!success) {
      throw new ValidationException("Failed to create post comment", error);
    }
    const memberId = (req.user as Member).id;
    const comment = await this.postCommentService.create(data, memberId);
    return successResponse(
      res,
      "Post comment created successfully",
      PostCommentResource.toResource(comment)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(
      updatePostCommentSchema,
      req.body
    );
    if (!success) {
      throw new ValidationException("Failed to update post comment", error);
    }
    const memberId = (req.user as Member).id;
    const comment = await this.postCommentService.update(
      +req.params.id,
      data,
      memberId
    );
    return successResponse(
      res,
      "Post comment updated successfully",
      PostCommentResource.toResource(comment)
    );
  }

  async destroy(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    await this.postCommentService.destroy(+req.params.id, memberId);
    return successResponse(res, "Post comment deleted successfully");
  }
}

export default PostCommentController;
