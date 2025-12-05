import { Request, Response } from "express";
import MemberService from "../../../services/admin/v1/member.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../../../schemas/admin/v1/member.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { MemberCollection } from "../../../resources/admin/v1/member/member.collection";
import { MemberResource } from "../../../resources/admin/v1/member/member.resource";

class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    if (page && perPage) {
      const members = await this.memberService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Member list successfully",
        MemberCollection.withPagination(members)
      );
    }

    const members = await this.memberService.findAll();
    return successResponse(
      res,
      "Member list successfully",
      MemberCollection.toCollection(members)
    );
  }

  async findOne(req: Request, res: Response) {
    const member = await this.memberService.findOne(+req.params.id);
    return successResponse(
      res,
      "Member details successfully",
      MemberResource.toResource(member)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error } = await validater(createMemberSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to create member", error);
    }

    const member = await this.memberService.create(data);
    return successResponse(
      res,
      "Member created successfully",
      MemberResource.toResource(member)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error } = await validater(updateMemberSchema, req.body);

    if (error) {
      throw new ValidationException("Failed to update member", error);
    }

    const member = await this.memberService.update(+req.params.id, data);
    return successResponse(
      res,
      "Member updated successfully",
      MemberResource.toResource(member)
    );
  }

  async destroy(req: Request, res: Response) {
    const member = await this.memberService.destroy(+req.params.id);
    return successResponse(
      res,
      "Member deleted successfully",
      MemberResource.toResource(member)
    );
  }
}

export default MemberController;
