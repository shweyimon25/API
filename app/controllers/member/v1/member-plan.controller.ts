import { Request, Response } from "express";
import MemberPlanService from "../../../services/member/v1/member-plan.service";
import { successResponse } from "../../../helpers/response";
import { MemberPlanResource } from "../../../resources/member/v1/member-plan/member-plan.resource";
import { MemberPlanCollection } from "../../../resources/member/v1/member-plan/member-plan.collection";

class MemberPlanController {
    private memberPlanService: MemberPlanService;

    constructor() {
        this.memberPlanService = new MemberPlanService();
    }

    async findAll(req: Request, res: Response) {
        const { search, duration, memberTypeId } = req.query;

        const filters: any = {};
        if (duration) {
            filters.duration = +duration as number;
        }
        if (search) {
            filters.search = search as string;
        }
        if (memberTypeId) {
            filters.memberTypeId = +memberTypeId as number;
        }

        const memberPlans = await this.memberPlanService.findAll(filters);

        return successResponse(res,
            "Member plan list successfully",
            MemberPlanCollection.toCollection(memberPlans)
        );
    }

    async findOne(req: Request, res: Response) {
        const memberPlan = await this.memberPlanService.findOne(+req.params.id);
        return successResponse(res,
            "Member plan details successfully",
            MemberPlanResource.toResource(memberPlan)
        );
    }
}

export default MemberPlanController;