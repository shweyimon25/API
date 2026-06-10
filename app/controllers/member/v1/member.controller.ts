import { Request, Response } from "express";
import { Member } from "@prisma/client";
import MemberService from "../../../services/member/v1/member.service";
import { successResponse } from "../../../helpers/response";
import { memberScope } from "../../../scopes/admin/v1/member.scope";
import { MemberCollection } from "../../../resources/member/v1/member/member.collection";
import prisma from "../../../../prisma/client";
import {
  MemberDetailRecord,
  buildMemberDetailData,
  fetchDefaultShopLevelAndDurations,
  fetchMemberCounts,
  fetchMemberDetailData,
  fetchMemberFriendMeta,
  memberDetailInclude,
} from "../../../helpers/member-detail.helper";

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
    const currentMemberId = (req.user as Member).id;
    const data = await fetchMemberDetailData(id, currentMemberId);

    if (!data) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Member not found",
          data: null,
        },
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data,
      },
    });
  }

  async getAllMembers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;
      const currentMemberId = (req.user as Member).id;
      const skip = (page - 1) * perPage;
      const whereCondition = memberScope(req.query);

      const totalMembers = await prisma.member.count({
        where: whereCondition,
      });

      const members = await prisma.member.findMany({
        where: whereCondition,
        skip,
        take: perPage,
        include: memberDetailInclude,
      });

      const { defaultShopLevel, planDurations } =
        await fetchDefaultShopLevelAndDurations();

      const mappedMembers = await Promise.all(
        members.map(async (member) => {
          const [counts, friendMeta] = await Promise.all([
            fetchMemberCounts(member.id, member.shop?.id ?? null),
            fetchMemberFriendMeta(currentMemberId, member.id),
          ]);

          return buildMemberDetailData(
            member as MemberDetailRecord,
            counts,
            friendMeta,
            defaultShopLevel,
            planDurations
          );
        })
      );

      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: true,
          data: mappedMembers,
          pagination: {
            total_items: totalMembers,
            current_page: page,
            per_page: perPage,
            total_pages: Math.ceil(totalMembers / perPage),
          },
        },
      });
    } catch (error) {
      console.error(error);
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Member not found",
          data: null,
        },
      });
    }
  }
}

export default MemberController;
