import { Request, Response } from "express";
import { Member } from "@prisma/client";
import ConversationService from "../../../services/member/v1/conversation.service";
import { successResponse } from "../../../helpers/response";
import { conversationScope } from "../../../scopes/member/v1/conversation.scope";
import { validater } from "../../../helpers/validator";
import {
    addParticipantsSchema,
    createConversationSchema,
    requestAcceptConversationSchema,
    updateConversationSchema
} from "../../../schemas/member/v1/conversation.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { ConversationCollection } from "../../../resources/member/v1/conversation/conversation.collection";
import { ConversationResource } from "../../../resources/member/v1/conversation/conversation.resource";

class ConversationController {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;
        const memberId = (req.user as Member).id;
        const where = conversationScope(req.query, memberId);

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
                ConversationCollection.withPagination(conversations),
            );
        }

        const conversations = await this.conversationService.findAll(memberId, where);

        return successResponse(
            res,
            "Conversations list successfully",
            ConversationCollection.toCollection(conversations),
        );
    }

    async findCommonAll(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const where = conversationScope(req.query, memberId);
        const conversations = await this.conversationService.findCommonAll(memberId, where);
        return successResponse(res, "Common Conversations list successfully", conversations);
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;
        const memberId = (req.user as Member).id;
        const conversation = await this.conversationService.findOne(memberId, +id);
        return successResponse(res, "Conversation found successfully",
            ConversationResource.toResource(conversation)
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createConversationSchema, req.body);

        if (!success) {
            throw new ValidationException("Create Conversation Failed", error);
        }

        const files = req.files as Express.Multer.File[];
        const memberId = (req.user as Member).id;

        const conversation = await this.conversationService.create(
            memberId,
            data,
            files
        );

        return successResponse(res, "Conversation created successfully", conversation)
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateConversationSchema, req.body);

        if (!success) {
            throw new ValidationException("Update Conversation Failed", error);
        }

        const { id } = req.params;
        const memberId = (req.user as Member).id;
        const files = req.files as Express.Multer.File[];

        const conversation = await this.conversationService.update(
            memberId,
            +id,
            data,
            files
        );

        return successResponse(res, "Conversation updated successfully",
            ConversationResource.toResource(conversation)
        );
    }

    async addParticipants(req: Request, res: Response) {
        const { data, success, error } = await validater(addParticipantsSchema, req.body);

        if (!success) {
            throw new ValidationException("Add participants failed", error);
        }

        const { id } = req.params;
        const memberId = (req.user as Member).id;

        const conversation = await this.conversationService.addedParticipants(
            memberId,
            +id,
            data
        );

        return successResponse(
            res,
            "Conversation participants added successfully",
            ConversationResource.toResource(conversation),
        );
    }

    async removeParticipants(req: Request, res: Response) {
        const { id, participantId } = req.params;
        const memberId = (req.user as Member).id; 
        const conversation = await this.conversationService.removeParticipant(memberId, +id, +participantId);

        return successResponse(res, "Conversation participants removed successfully",
            ConversationResource.toResource(conversation),
        );
    }

    async requestAccept(req: Request, res: Response) {
        const { data, success, error } = await validater(requestAcceptConversationSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to change status conversation request", error);
        }

        const { id } = req.params;
        const memberId = (req.user as Member).id;
        const conversation = await this.conversationService.requestAccept(+id, data, memberId);

        return successResponse(res, "Conversation update status successfully", conversation);
    }

    async destroy(req: Request, res: Response) {
        const { id } = req.params;
        const memberId = (req.user as Member).id;
        await this.conversationService.destroy(memberId, +id);
        return successResponse(res, "Conversation deleted successfully");
    }
}

export default ConversationController;
