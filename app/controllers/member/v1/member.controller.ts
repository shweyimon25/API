import { Request, Response } from "express";
import MemberService from "../../../services/member/v1/member.service";
import { successResponse } from "../../../helpers/response";
import { memberScope } from "../../../scopes/admin/v1/member.scope";
import { MemberResource } from "../../../resources/admin/v1/member/member.resource";
import { MemberCollection } from "../../../resources/member/v1/member/member.collection";

class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = memberScope(req.query);

    if (page && perPage) {
      const members = await this.memberService.findByPaginate(
        +page,
        +perPage,
        where,
      );

      return successResponse(res, "Members retrieved successfully", members);
    }

    const members = await this.memberService.findAll(where);
    return successResponse(res, "Members retrieved successfully", MemberCollection.toCollection(members));
  }

  async findCommonAll(req: Request, res: Response) {
    const where = memberScope(req.query);
    const members = await this.memberService.findCommonAll(where);
    return successResponse(res, "Members retrieved successfully", MemberCollection.toCommonCollection(members));
  }

  async findOne(req: Request, res: Response) {
    const id = +req.params.id;
    const member = await this.memberService.findOne(id);
    return successResponse(res, "Member retrieved successfully", MemberResource.toResource(member));
  }
}

export default MemberController;
