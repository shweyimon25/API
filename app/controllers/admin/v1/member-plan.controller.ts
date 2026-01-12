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
import { Prisma, Status, User } from "@prisma/client";

class MemberPlanController {
  private memberPlanService: MemberPlanService;

  constructor() {
    this.memberPlanService = new MemberPlanService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, status, search, memberTypeId, minPrice, maxPrice, duration, isVideoGroup } = req.query;

    const where: Prisma.MemberPlanWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { memberType: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status as Status;
    }

    if (memberTypeId) {
      where.memberTypeId = +memberTypeId as number;
    }

    if (minPrice) {
      where.price = {
        gte: +minPrice as number,
      };
    }

    if (maxPrice) {
      where.price = {
        lte: +maxPrice as number,
      };
    }

    if (duration) {
      where.duration = +duration as number;
    }

    if (isVideoGroup) {
      where.isVideoGroup = isVideoGroup === "true" ? true : false;
    }

    if (page && perPage) {
      const memberPlans = await this.memberPlanService.findByPaginate(
        +page,
        +perPage,
        where
      );

      return successResponse(
        res,
        "Member plan list successfully",
        MemberPlanCollection.withPagination(memberPlans)
      );
    }

    const memberPlans = await this.memberPlanService.findAll(where);
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

  async findCommonAll(req: Request, res: Response) {
    const { search } = req.query;

    const where: Prisma.MemberPlanWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { memberType: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    const memberPlans = await this.memberPlanService.findCommonAll(where);

    return successResponse(
      res,
      "Common member plan list successfully",
      MemberPlanCollection.toCommonCollection(memberPlans)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(createMemberPlanSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to created member plan", error);
    }

    const userId = (req.user as User)?.id;
    const memberPlan = await this.memberPlanService.create(data, +userId);

    return successResponse(
      res,
      "Member plan created successfully",
      MemberPlanResource.toResource(memberPlan)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { data, success, error } = await validater(updateMemberPlanSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to updated member plan", error);
    }

    const userId = (req.user as User)?.id;
    const memberPlan = await this.memberPlanService.update(+id, data, +userId);

    return successResponse(
      res,
      "Member plan updated successfully",
      MemberPlanResource.toResource(memberPlan)
    );
  }

  async destory(req: Request, res: Response) {
    const userId = (req.user as User)?.id;
    await this.memberPlanService.destroy(+req.params.id, +userId);
    return successResponse(res, "Member plan deleted successfully");
  }
}

export default MemberPlanController;
