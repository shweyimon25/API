
import { successResponse } from "../../../helpers/response";
import { MemberTypeCollection } from "../../../resources/admin/v1/member-type/member-type.collection";
import { MemberTypeResource } from "../../../resources/admin/v1/member-type/member-type.resource";
import MemberTypeService from "../../../services/admin/v1/member-type.service";
import { Request, Response } from "express";
import { memberTypeScope } from "../../../scopes/admin/v1/member-type.scope";

class MemberTypeController {
  private memberTypeService: MemberTypeService;

  constructor() {
    this.memberTypeService = new MemberTypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = memberTypeScope(req.query);

    if (page && perPage) {
      const memberTypes = await this.memberTypeService.findByPaginate(
        +page,
        +perPage,
        where
      );

      return successResponse(
        res,
        "Member type list successfully",
        MemberTypeCollection.withPagination(memberTypes)
      );
    }

    const memberTypes = await this.memberTypeService.findAll(where);

    return successResponse(
      res,
      "Member type list successfully",
      MemberTypeCollection.toCollection(memberTypes)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = memberTypeScope(req.query);

    const memberTypes = await this.memberTypeService.findCommonAll(where);

    return successResponse(
      res,
      "Common member type list successfully",
      MemberTypeCollection.toCommonCollection(memberTypes)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const memberType = await this.memberTypeService.findOne(+id);

    return successResponse(
      res,
      "Member type detail successfully",
      MemberTypeResource.toResource(memberType)
    );
  }
}

export default MemberTypeController;
