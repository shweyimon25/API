import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import { gymMemberRequestSchema, trainerMemberRequestSchema } from "../../../schemas/member/v1/member-request.schema";
import { ValidationException } from "../../../helpers/exceptions";
import MemberShipService from "../../../services/member/v1/member-request.service";
import MembershipService from "../../../services/member/v1/member-request.service";
import { Member, User } from "@prisma/client";
import { successResponse } from "../../../helpers/response";

class MemberRequestController {
    private membershipService: MemberShipService;

    constructor() {
        this.membershipService = new MembershipService();
    }

    async trainerMemberRequest(req: Request, res: Response) {
        const { data, error, success } = await validater(trainerMemberRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Member request failed", error);
        }

        const trainerMember = await this.membershipService.trainerMemberRequest(data, req.files as Express.Multer.File[], (req.user as User).id);
        return successResponse(res, "Trainer member request successfully", trainerMember);
    }

    async gymMemberRequest(req: Request, res: Response) {
        const { data, error, success } = await validater(gymMemberRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Member request failed", error);
        }

        const gymMemberRequest = await this.membershipService.gymMemberRequest(data, (req.user as Member).id);
        return successResponse(res, "Gym member request successfully", gymMemberRequest);
    }
}

export default MemberRequestController;