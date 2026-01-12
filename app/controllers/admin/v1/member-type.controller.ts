import { Prisma, Status } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import { MemberTypeCollection } from "../../../resources/admin/v1/member-type/member-type.collection";
import { MemberTypeResource } from "../../../resources/admin/v1/member-type/member-type.resource";
import MemberTypeService from "../../../services/admin/v1/member-type.service";
import { Request, Response } from "express";

class MemberTypeController {
  private memberTypeService: MemberTypeService;

  constructor() {
    this.memberTypeService = new MemberTypeService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, search, status } = req.query;

    const where: Prisma.MemberTypeWhereInput = {};

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive"
      };
    }

    if (status) {
      where.status = status as Status;
    }

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
    const { search } = req.query;

    const where: Prisma.MemberTypeWhereInput = {};

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive"
      };
    }

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
