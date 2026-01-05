import { successResponse } from "../../../helpers/response";
import { Request, Response } from "express";
import MemberTypeService from "../../../services/member/v1/member-type.service";
import { MemberTypeCollection } from "../../../resources/member/v1/member-type/member-type.collection";

class MemberTypeController {
  private memberTypeService: MemberTypeService;

  constructor() {
    this.memberTypeService = new MemberTypeService();
  }

  async findAll(req: Request, res: Response) {
    const memberTypes = await this.memberTypeService.findAll();
    return successResponse(
      res,
      "Member type list successfully",
      MemberTypeCollection.toCollection(memberTypes)
    );
  }
}

export default MemberTypeController;
