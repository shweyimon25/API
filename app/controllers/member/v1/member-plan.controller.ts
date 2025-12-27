import { Request, Response } from "express";
import MemberPlanService from "../../../services/member/v1/member-plan.service";
import { successResponse } from "../../../helpers/response";
import { MemberPlanCollection } from "../../../resources/member/v1/member-plan/member-plan.collection";
import { MemberPlanResource } from "../../../resources/member/v1/member-plan/member-plan.resource";

class MemberPlanController {
  private memberPlanService: MemberPlanService;

  constructor() {
    this.memberPlanService = new MemberPlanService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const memberPlans = await this.memberPlanService.findByPaginate(
        +page,
        +perPage
      );
      return successResponse(
        res,
        "Member plan list successfully",
        MemberPlanCollection.withPagination(memberPlans)
      );
    }

    const memberPlans = await this.memberPlanService.findAll();
    return successResponse(
      res,
      "Member plan list successfully",
      MemberPlanCollection.toCollection(memberPlans)
    );
  }

  async findOne(req: Request, res: Response) {
    const memberPlan = await this.memberPlanService.findOne(+req.params.id);
    return successResponse(
      res,
      "Member plan details successfully",
      MemberPlanResource.toResource(memberPlan)
    );
  }
}

export default MemberPlanController;
