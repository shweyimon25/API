import { successResponse } from "../../../helpers/response";
import { MemberTypeCollection } from "../../../resources/member/v1/member-type/member-type.collection";
import { MemberTypeResource } from "../../../resources/member/v1/member-type/member-type.resource";
import MemberTypeService from "../../../services/member/v1/member-type.service";
import { Request, Response } from "express";

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

  async findOne(req: Request, res: Response) {
    const memberType = await this.memberTypeService.findOne(+req.params.id);
    return successResponse(
      res,
      "Member type details successfully",
      MemberTypeResource.toResource(memberType)
    );
  }
}

export default MemberTypeController;
