import { MemberRequestStatus, Prisma, User } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import { Request, Response } from "express";
import { MemberRequestCollection } from "../../../resources/admin/v1/member-request/member-request.collection";
import { MemberRequestResource } from "../../../resources/admin/v1/member-request/member-request.resource";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { updateMemberRequestSchema } from "../../../schemas/admin/v1/member-request.schema";
import MemberRequestService from "../../../services/admin/v1/member-request.service";

class MemberRequestController {
    private memberRequestService: MemberRequestService;

    constructor() {
        this.memberRequestService = new MemberRequestService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage, name, email, phone, status, memberTypeId, memberPlanId } = req.query;

        let where: Prisma.MemberRequestWhereInput = {};

        if (name || email || phone) {
            where.OR = [];
            if (name) {
                where.OR.push({
                    member: {
                        name: {
                            contains: name as string,
                        },
                    },
                });
            }
            if (email) {
                where.OR.push({
                    member: {
                        email: {
                            contains: email as string,
                        },
                    },
                });
            }
            if (phone) {
                where.OR.push({
                    member: {
                        phone: {
                            contains: phone as string,
                        },
                    },
                });
            }
        }

        if (status) {
            where.status = status as MemberRequestStatus;
        }

        if (memberTypeId) {
            where.memberTypeId = +memberTypeId;
        }

        // if (memberPlanId) {
        //     where.memberPlanId = +memberPlanId;
        // }

        if (page && perPage) {
            const memberRequests = await this.memberRequestService.findByPaginate(
                +page,
                +perPage,
                where
            );
            return successResponse(
                res,
                "Member type list successfully",
                MemberRequestCollection.withPagination(memberRequests)
            );
        }

        const memberRequests = await this.memberRequestService.findAll(where);

        return successResponse(
            res,
            "Member type list successfully",
            MemberRequestCollection.toCollection(memberRequests)
        );
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { data, error, success } = await validater(updateMemberRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update member request", error);
        }

        const memberRequest = await this.memberRequestService.update(+id, data, (req.user as User).id);

        return successResponse(
            res,
            `Member request ${data.status === MemberRequestStatus.APPROVED ? "approved" : "rejected"} successfully`,
            MemberRequestResource.toResource(memberRequest)
        );
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;
        const memberRequest = await this.memberRequestService.findOne(+id);
        return successResponse(
            res,
            "Member request detail successfully",
            MemberRequestResource.toResource(memberRequest)
        );
    }
}

export default MemberRequestController;
