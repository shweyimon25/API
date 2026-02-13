import { Request, Response } from "express";
import { Member } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import {
    createFriendRequestSchema,
    updateFriendRequestSchema,
} from "../../../schemas/member/v1/friend-request.schema";
import {
    FriendRequestResource,
} from "../../../resources/member/v1/friend-request/friend-request.resource";
import { FriendRequestCollection } from "../../../resources/member/v1/friend-request/friend-request.collection";
import FriendRequestService from "../../../services/member/v1/friend-request.service";

class FriendRequestController {
    private friendRequestService: FriendRequestService;

    constructor() {
        this.friendRequestService = new FriendRequestService();
    }

    async findAll(req: Request, res: Response) {
        const { type, page, perPage } = req.query;
        const memberId = (req.user as Member).id;

        if (!type || (type !== "sent" && type !== "received")) {
            throw new ValidationException("Failed to list friend requests", [
                { field: "type", issue: "type must be 'sent' or 'received'" },
            ]);
        }

        if (page && perPage) {
            const result = await this.friendRequestService.findByPaginate(
                memberId,
                type as "sent" | "received",
                +page,
                +perPage
            );
            return successResponse(
                res,
                "Friend requests list successfully",
                FriendRequestCollection.withPagination(result)
            );
        }

        const requests = await this.friendRequestService.findAll(
            memberId,
            type as "sent" | "received"
        );
        return successResponse(
            res,
            "Friend requests list successfully",
            FriendRequestCollection.toCollection(requests)
        );
    }

    async findOne(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const request = await this.friendRequestService.findOne(
            +req.params.id,
            memberId
        );
        return successResponse(
            res,
            "Friend request details successfully",
            FriendRequestResource.toResource(request)
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(
            createFriendRequestSchema,
            req.body
        );
        if (!success) {
            throw new ValidationException("Failed to create friend request", error);
        }
        const memberId = (req.user as Member).id;
        const request = await this.friendRequestService.create(data, memberId);

        return successResponse(
            res,
            "Friend request sent successfully",
            FriendRequestResource.toResource(request)
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(
            updateFriendRequestSchema,
            req.body
        );
        if (!success) {
            throw new ValidationException("Failed to update friend request", error);
        }
        const memberId = (req.user as Member).id;
        const request = await this.friendRequestService.update(
            +req.params.id,
            data,
            memberId
        );
        return successResponse(
            res,
            data.status === "ACCEPTED"
                ? "Friend request accepted successfully"
                : "Friend request declined successfully",
            FriendRequestResource.toResource(request)
        );
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        await this.friendRequestService.destroy(+req.params.id, memberId);
        return successResponse(res, "Friend request cancelled successfully");
    }
}

export default FriendRequestController;
