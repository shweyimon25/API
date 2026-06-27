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


  async updateMemberData(req: Request, res: Response) {
    try {
      const paramId = parseInt(req.params.id);
      const { params } = req.body; 
      const currentMemberId = (req.user as Member).id;

      if (!paramId || isNaN(paramId)) {
        return res.status(400).json({
          jsonrpc: "2.0",
          id: null,
          error: { message: "Invalid or missing Member ID." }
        });
      }

      const memberId = await this.resolveMemberIdForUpdate(paramId, currentMemberId);
      if (!memberId) {
        return res.status(404).json({
          jsonrpc: "2.0",
          id: null,
          error: { message: "Member not found." }
        });
      }

      if (memberId !== currentMemberId) {
        return res.status(403).json({
          jsonrpc: "2.0",
          id: null,
          error: { message: "You are not allowed to update this member." }
        });
      }

      const isResettingToZero = params.weight === 0;

      await prisma.$transaction(async (tx) => {
        
        if (params.gender !== undefined || params.age !== undefined) {
          
          const incomingGender = params.gender?.trim().toUpperCase();
          const finalGender = (incomingGender === "MALE" || incomingGender === "FEMALE") 
            ? incomingGender 
            : "MALE";

          const profileData = {
            ...(params.gender !== undefined ? { gender: finalGender } : {}),
            ...(params.age !== undefined
              ? { age: parseInt(params.age.toString(), 10) }
              : {}),
          };

          await tx.memberProfile.upsert({
            where: { memberId },
            update: profileData,
            create: {
              memberId,
              ...profileData,
            },
          });
        }

        const measurementData = {
          heightFeet:   params.height_ft?.toString() ?? "0",
          heightInches: params.height_in?.toString() ?? "0",
          weight:       params.weight?.toString() ?? "0",
          neck:         params.neck?.toString() ?? "0",
          waist:        params.waist?.toString() ?? "0",
          shoulders:    params.shoulders?.toString() ?? "0",
          thigh:        params.thigh?.toString() ?? "0",
          calf:         params.calf?.toString() ?? "0",
          arms:         params.arms?.toString() ?? "0",
          wrist:        params.wrist?.toString() ?? "0",
          chest:        params.chest?.toString() ?? "0",
          hip:          params.hip?.toString() ?? "0",
        };
        await tx.bodyMeasurement.upsert({
          where: { memberId: memberId },
          update: measurementData,
          create: {
            memberId: memberId,
            ...measurementData
          }
        });

        if (!isResettingToZero) {
          await tx.weightHistory.create({
            data: {
              memberId:   memberId,
              date:       new Date(),
              heightFeet: params.height_ft ?? 0,
              heightInch: params.height_in ?? 0,
              weight:     params.weight ?? 0.0,
              neck:       params.neck ?? 0.0,
              calf:       params.calf ?? 0.0,
              wristLeft:  params.wrist ?? 0.0,
              waist:      params.waist ?? 0.0,
              hip:        params.hip ?? 0.0,
              shoulders:  params.shoulders ?? 0.0,
              armLeft:    params.arms ?? 0.0,
              thighLeft:  params.thigh ?? 0.0,
              bmi:        params.bmi ?? 0.0,
              armRight:   params.arms_right ?? params.arms ?? 0.0,   
              thighRight: params.thigh_right ?? params.thigh ?? 0.0, 
              bfp:        params.bfp ?? 0.0                         
            }
          });
        }
      });

      return res.status(200).json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: true,
          message: "Profile gender updated and body measurements recorded successfully.",
          data: await fetchMemberDetailData(memberId, currentMemberId)
        }
      });

    } catch (error: any) {
      console.error("Update Member Data Error:", error);
      return res.status(500).json({
        jsonrpc: "2.0",
        id: null,
        error: { message: "Internal Server Error", data: error.message }
      });
    }
  }

  private async resolveMemberIdForUpdate(
    paramId: number,
    currentMemberId: number
  ) {
    if (paramId === currentMemberId) {
      return currentMemberId;
    }

    if (paramId === currentMemberId + 1) {
      return currentMemberId;
    }

    const member = await prisma.member.findUnique({
      where: { id: paramId },
      select: { id: true },
    });
    if (member) {
      return member.id;
    }

    const partnerMember = await prisma.member.findUnique({
      where: { id: paramId - 1 },
      select: { id: true },
    });
    if (partnerMember) {
      return partnerMember.id;
    }

    return null;
  }
    
}

export default MemberController;
