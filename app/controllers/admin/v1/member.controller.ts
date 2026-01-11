import { Request, Response } from "express";
import { Prisma, User } from "@prisma/client";
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
import { Gender, Status } from "@prisma/client";

class MemberController {
  private memberService: MemberService;

  constructor() {
    this.memberService = new MemberService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, search, status, memberTypeId, gender, email, phone, code } = req.query;

    const filters: Prisma.MemberWhereInput = {};

    if (status) {
      filters.status = status as Status;
    }

    if (memberTypeId) {
      filters.memberTypeId = +memberTypeId;
    }

    if (gender) {
      filters.profile = {
        gender: gender as Gender,
      };
    }

    if (email) {
      filters.email = { contains: email as string, mode: "insensitive" };
    }

    if (phone) {
      filters.phone = { contains: phone as string, mode: "insensitive" };
    }

    if (code) {
      filters.code = { contains: code as string, mode: "insensitive" };
    }

    if (search) {
      filters.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { code: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { phone: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (page && perPage) {
      const members = await this.memberService.findByPaginate(+page, +perPage, filters);

      return successResponse(
        res,
        "Member list successfully",
        MemberCollection.withPagination(members)
      );
    }

    const members = await this.memberService.findAll(filters);

    return successResponse(
      res,
      "Member list successfully",
      MemberCollection.toCollection(members)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const members = await this.memberService.findCommonAll();

    return successResponse(
      res,
      "Member list successfully",
      MemberCollection.toCommonCollection(members)
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
    const { data, success, error } = await validater(createMemberSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to create member", error);
    }

    const userId = (req.user as User).id;
    const member = await this.memberService.create(data, +userId);

    return successResponse(
      res,
      "Member created successfully",
      MemberResource.toResource(member)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(updateMemberSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to update member", error);
    }

    const userId = (req.user as User).id;
    const member = await this.memberService.update(+req.params.id, data, +userId);

    return successResponse(
      res,
      "Member updated successfully",
      MemberResource.toResource(member)
    );
  }

  async destroy(req: Request, res: Response) {
    const userId = (req.user as User).id;
    await this.memberService.destroy(+req.params.id, +userId);
    return successResponse(res, "Member deleted successfully");
  }
}

export default MemberController;
