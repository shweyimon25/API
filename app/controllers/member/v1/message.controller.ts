import { Request, Response } from "express";
import { Member } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import MessageService from "../../../services/member/v1/message.service";
import { messageScope } from "../../../scopes/member/v1/message.scope";
import { MessageCollection } from "../../../resources/member/v1/message/message.collection";
import { MessageResource } from "../../../resources/member/v1/message/message.resource";
import { upload } from "../../../helpers/media-upload";
import { BadRequestException, ValidationException } from "../../../helpers/exceptions";
import { validater } from "../../../helpers/validator";
import { uploadMessageSchema } from "../../../schemas/member/v1/message.schema";

class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;
        const memberId = (req.user as Member).id;

        const where = messageScope(req.query, memberId);

        if (page && perPage) {
            const messages = await this.messageService.findByPaginate(
                +page,
                +perPage,
                where,
            );

            return successResponse(res, "Members retrieved successfully", MessageCollection.withPagination(messages));
        }

        const messages = await this.messageService.findAll(where);
        return successResponse(res, "Message retrieved successfully", MessageCollection.toCollection(messages));
    }

    async findOne(req: Request, res: Response) {
        const id = +req.params.id;
        const memberId = (req.user as Member).id;
        const message = await this.messageService.findOne(id, memberId);

        return successResponse(res, "Member details successfully", MessageResource.toResource(message));
    }

    async uploadAttachments(req: Request, res: Response) {
        const { data, error, success } = await validater(uploadMessageSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to upload", error);
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            throw new ValidationException("Failed to upload", [
                {
                    field: "files",
                    issue: "files are required"
                }
            ]);
        }

        const { type } = data;

        const files: { url: string; type: string }[] = [];

        for (const file of req.files) {
            if (file.fieldname === "files") {
                const { fileUrl } = await upload(file, "message");

                files.push({
                    url: fileUrl,
                    type: type
                });
            }
        }

        return successResponse(res, "Files uploaded successfully", files);
    }
}

export default MessageController;
