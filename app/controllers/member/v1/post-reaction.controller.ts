import { Request, Response } from "express";
import { Member } from "@prisma/client";
import PostReactionService from "../../../services/member/v1/post-reaction.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { BadRequestException, ValidationException } from "../../../helpers/exceptions";
import { createPostReactionSchema } from "../../../schemas/member/v1/post-reaction.schema";
import { PostReactionResource } from "../../../resources/member/v1/post-reaction/post-reaction.resource";

class PostReactionController {
    private postReactionService: PostReactionService;

    constructor() {
        this.postReactionService = new PostReactionService();
    }

    async findAll(req: Request, res: Response) {
        const { postId } = req.query;

        if (!postId) {
            throw new BadRequestException("Post id query parameter is required");
        }

        const reactions = await this.postReactionService.findAll(+postId);

        return successResponse(res, "Post reactions retrieved successfully", reactions.map(PostReactionResource.toResource));
    }

    async findOne(req: Request, res: Response) {
        const reaction = await this.postReactionService.findOne(+req.params.id);
        return successResponse(res, "Post reaction retrieved successfully", PostReactionResource.toResource(reaction));
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createPostReactionSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to toggle post reaction", error);
        }
        const memberId = (req.user as Member).id;
        const reaction = await this.postReactionService.give(data, memberId);
        if (reaction) {
            return successResponse(res, "Post reaction added successfully", PostReactionResource.toResource(reaction));
        }
        return successResponse(res, "Post reaction removed successfully");
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        await this.postReactionService.destroy(+req.params.id, memberId);
        return successResponse(res, "Post reaction deleted successfully");
    }
}

export default PostReactionController;
