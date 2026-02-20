import { Request, Response } from "express";
import { Member } from "@prisma/client";
import ConversationService from "../../../services/member/v1/conversation.service";
import { successResponse } from "../../../helpers/response";
import { conversationScope } from "../../../scopes/member/v1/conversation.scope";
import { validater } from "../../../helpers/validator";
import { createConversationSchema, updateConversationSchema } from "../../../schemas/member/v1/conversation.schema";
import { ValidationException } from "../../../helpers/exceptions";

class ConversationController {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;
        const where = conversationScope(req.query);
        const memberId = (req.user as Member).id;

        if (page && perPage) {
            const conversations = await this.conversationService.findByPaginate(
                memberId,
                +page,
                +perPage,
                where
            );

            return successResponse(
                res,
                "Conversations list successfully",
                conversations
            );
        }

        const conversations = await this.conversationService.findAll(memberId, where);

        return successResponse(
            res,
            "Conversations list successfully",
            conversations
        );
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;
        const memberId = (req.user as Member).id;
        const conversation = await this.conversationService.findOne(memberId, +id);
        return successResponse(res, "Conversation found successfully", conversation);
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createConversationSchema, req.body);

        if (!success) {
            throw new ValidationException("Create Conversation Failed", error);
        }

        const memberId = (req.user as Member).id;
        const conversation = await this.conversationService.create(
            memberId,
            data
        );

        return successResponse(res, "Conversation created successfully", conversation);
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateConversationSchema, req.body);

        if (!success) {
            throw new ValidationException("Update Conversation Failed", error);
        }

        const { id } = req.params;
        const memberId = (req.user as Member).id;
        const conversation = await this.conversationService.update(
            memberId,
            +id,
            data
        );

        return successResponse(res, "Conversation updated successfully", conversation);
    }

    async destroy(req: Request, res: Response) {
        const { id } = req.params;
        const memberId = (req.user as Member).id;
        await this.conversationService.destroy(memberId, +id);
        return successResponse(res, "Conversation deleted successfully");
    }
}

export default ConversationController;
