import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import { trainerMemberRequestSchema } from "../../../schemas/member/v1/membership.schema";
import { ValidationException } from "../../../helpers/exceptions";
import MemberShipService from "../../../services/member/v1/membership.service";
import MembershipService from "../../../services/member/v1/membership.service";

class MemberShipController {
    private membershipService: MemberShipService;

    constructor() {
        this.membershipService = new MembershipService();
    }

    async trainerMemberRequest(req: Request, res: Response) {
        const { data, error, success } = await validater(trainerMemberRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Member request failed", error);
        }

        this.membershipService.trainerMemberRequest(data);
    }
}

export default MemberShipController;