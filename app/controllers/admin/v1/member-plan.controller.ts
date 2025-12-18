import { Request, Response } from "express";
import MemberPlanService from "../../../services/admin/v1/member-plan.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createMemberPlanSchema,
  updateMemberPlanSchema,
} from "../../../schemas/admin/v1/member-plan.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { MemberPlanCollection } from "../../../resources/admin/v1/member-plan/member-plan.collection";
import { MemberPlanResource } from "../../../resources/admin/v1/member-plan/member-plan.resource";

class MemberPlanController {
  private memberPlanService: MemberPlanService;

  constructor() {
    this.memberPlanService = new MemberPlanService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, status, search } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search as string;
    }

    if (page && perPage) {
      const memberPlans = await this.memberPlanService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
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

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createMemberPlanSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to created member plan", error);
    }

    const memberPlan = await this.memberPlanService.create(data);
    return successResponse(
      res,
      "Member plan created successfully",
      MemberPlanResource.toResource(memberPlan)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateMemberPlanSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to updated member plan", error);
    }

    const memberPlan = await this.memberPlanService.create(data);
    return successResponse(
      res,
      "Member plan updated successfully",
      MemberPlanResource.toResource(memberPlan)
    );
  }

  async destory(req: Request, res: Response) {
    const memberPlan = await this.memberPlanService.destroy(+req.params.id);
    return successResponse(
      res,
      "Member plan deleted successfully",
      MemberPlanResource.toResource(memberPlan)
    );
  }
}

export default MemberPlanController;
