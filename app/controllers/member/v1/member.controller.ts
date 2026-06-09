import { Request, Response } from "express";
import MemberService from "../../../services/member/v1/member.service";
import { successResponse } from "../../../helpers/response";
import { memberScope } from "../../../scopes/admin/v1/member.scope";
import { MemberCollection } from "../../../resources/member/v1/member/member.collection";
import prisma from "../../../../prisma/client";

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

    const member = await prisma.member.findFirst({
      where: {
        id: id,
      },
      include: {
        profile: true,
        shop: {
          include: {
            posts: true,
            shopLevel: true,
          },
        },
        posts: true,
        friends: true,
        bodyMeasurement: true,
        memberType: true,
        memberRequests: {
          include: {
            memberPlan: true,
          },
        },
        proficientLevel: true,
        bodyGoal: true,
      },
    });

    if (!member) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Member not found",
          "data": null
        }
      })
    }

    const latestMemberRequest = member.memberRequests?.[0];
    const memberPlan = latestMemberRequest?.memberPlan;

    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
        "isFullFilled": true,
        "message": "Profile fetched successfully",
        "data": {
          id: member.id,
          client_code: member.code,
          im_status: "online",
          name: member.name,
          image_1920: member.profile?.profilePhoto,
          cover_photo: member.profile?.coverPhoto,
          bio: member.profile?.bio,
          total_shop_post: member.shop?.posts?.length ?? 0,
          total_social_post: member.posts?.length ?? 0,
          total_friend: member.friends.length || 0,
          friend_status: "you",
          friend_req_status: "none",
          friend_request_id: null,
          is_follow: null,
          follower_count: null,
          following_count: null,
          follower_id: null,
          login: member.phone,
          partner_id: member.id,
          company_id: 1,
          phone: member.phone,
          address: member.profile?.address,
          gender: member.profile?.gender,
          dob: member.profile?.age,
          age: member.profile?.age,
          height_ft: member.bodyMeasurement?.heightFeet,
          height_in: member.bodyMeasurement?.heightInches,
          weight: member.bodyMeasurement?.weight,
          neck: member.bodyMeasurement?.neck,
          calf: member.bodyMeasurement?.calf,
          waist: member.bodyMeasurement?.waist,
          chest: member.bodyMeasurement?.chest,
          hip: member.bodyMeasurement?.hip,
          shoulders: member.bodyMeasurement?.shoulders,
          arms: member.bodyMeasurement?.arms,
          thigh: member.bodyMeasurement?.thigh,
          client_type: member.clientType,
          request_id: latestMemberRequest
            ? {
              confirm_date: latestMemberRequest.approvedAt,
              expired_date: memberPlan?.expiredAt ?? null,
              name: "YC/26/000011",
              id: latestMemberRequest.id,
            }
            : null,
          member_plan_id: memberPlan
            ? {
              id: memberPlan.id,
              price: memberPlan.price,
              res_video_group: memberPlan.isVideoGroup,
              data_type: member.memberType?.name,
              duration: memberPlan.duration,
              member_type: memberPlan.name,
            }
            : null,
          shop_plan_id: {
            id: member.shop?.shopLevel?.id,
            price: member.shop?.shopLevel?.price,
            duration: member.shop?.shopLevel?.duration,
            member_type: member.shop?.shopLevel?.name,
          },
          proficient_level: member.proficientLevel?.name,
          main_goal_body_type: member.bodyGoal?.name,
          total_trainer_unread_count: 0,
          total_unread_count: 0,
          need_info: null,
          social_unread_noti_count: 0,
          friend_request_noti_count: 0
        }
      }
    })
  }

  async getAllMembers(req: Request, res: Response) {
    try {
        // 1. Get Query Parameters (Default values သတ်မှတ်ပေးထားပါတယ်)
        const page = parseInt(req.query.page as string) || 1;
        const perPage = parseInt(req.query.perPage as string) || 10;
        // const search = (req.query.search as string) || ""; // name သို့မဟုတ် code ရှာဖို့

        const skip = (page - 1) * perPage;
        const whereCondition = memberScope(req.query);

        // 3. Total Count ကို အရင်ဆွဲထုတ်မယ် (Pagination ရဲ့ Total Pages ကို တွက်ဖို့)
        const totalMembers = await prisma.member.count({
            where: whereCondition
        });

        // 4. Data တွေကို သက်ဆိုင်ရာ Relational Tables တွေနဲ့ တွဲပြီး ဆွဲထုတ်မယ်
        const members = await prisma.member.findMany({
            where: whereCondition,
            skip: skip,
            take: perPage,
            include: {
                profile: true,
                shop: {
                    include: {
                        posts: true,
                        shopLevel: true,
                    },
                },
                posts: true,
                friends: true,
                bodyMeasurement: true,
                memberType: true,
                memberRequests: {
                    include: {
                        memberPlan: true,
                    },
                    orderBy: {
                        createdAt: 'desc' // နောက်ဆုံးတင်ထားတဲ့ request ကို ယူရအောင် အစီအစဉ်စီထားတာပါ
                    }
                },
                proficientLevel: true,
                bodyGoal: true,
            },
        });

        // 5. ရလာတဲ့ Array ကို လက်ရှိသုံးနေတဲ့ Response format အတိုင်း Map လုပ်ပေးမယ်
        const mappedMembers = members.map((member) => {
            const latestMemberRequest = member.memberRequests?.[0];
            const memberPlan = latestMemberRequest?.memberPlan;

            return {
                id: member.id,
                client_code: member.code,
                im_status: "online",
                name: member.name,
                image_1920: member.profile?.profilePhoto,
                cover_photo: member.profile?.coverPhoto,
                bio: member.profile?.bio,
                total_shop_post: member.shop?.posts?.length ?? 0,
                total_social_post: member.posts?.length ?? 0,
                total_friend: member.friends.length || 0,
                friend_status: "you",
                friend_req_status: "none",
                friend_request_id: null,
                is_follow: null,
                follower_count: null,
                following_count: null,
                follower_id: null,
                login: member.phone,
                partner_id: member.id,
                company_id: 1,
                phone: member.phone,
                address: member.profile?.address,
                gender: member.profile?.gender,
                dob: member.profile?.age,
                age: member.profile?.age,
                height_ft: member.bodyMeasurement?.heightFeet,
                height_in: member.bodyMeasurement?.heightInches,
                weight: member.bodyMeasurement?.weight,
                neck: member.bodyMeasurement?.neck,
                calf: member.bodyMeasurement?.calf,
                waist: member.bodyMeasurement?.waist,
                chest: member.bodyMeasurement?.chest,
                hip: member.bodyMeasurement?.hip,
                shoulders: member.bodyMeasurement?.shoulders,
                arms: member.bodyMeasurement?.arms,
                thigh: member.bodyMeasurement?.thigh,
                client_type: member.clientType,
                request_id: latestMemberRequest
                    ? {
                        confirm_date: latestMemberRequest.approvedAt,
                        expired_date: memberPlan?.expiredAt ?? null,
                        name: "YC/26/000011",
                        id: latestMemberRequest.id,
                    }
                    : null,
                member_plan_id: memberPlan
                    ? {
                        id: memberPlan.id,
                        price: memberPlan.price,
                        res_video_group: memberPlan.isVideoGroup,
                        data_type: member.memberType?.name,
                        duration: memberPlan.duration,
                        member_type: memberPlan.name,
                    }
                    : null,
                shop_plan_id: member.shop?.shopLevel ? {
                    id: member.shop?.shopLevel?.id,
                    price: member.shop?.shopLevel?.price,
                    duration: member.shop?.shopLevel?.duration,
                    member_type: member.memberType?.name
                } : null,
                proficient_level: member.proficientLevel?.name,
                main_goal_body_type: member.bodyGoal?.name,
                total_trainer_unread_count: 0,
                total_unread_count: 0,
                need_info: null,
                social_unread_noti_count: 0,
                friend_request_noti_count: 0
            };
        });

        // 6. Return JSON Response with Pagination Meta Data
        return res.json({
            "jsonrpc": "2.0",
            "id": null,
            "result": {
                "isFullFilled": true,
                "message": "Members fetched successfully",
                "data": mappedMembers,
                "pagination": {
                    "total_items": totalMembers,
                    "current_page": page,
                    "per_page": perPage,
                    "total_pages": Math.ceil(totalMembers / perPage)
                }
            }
        });

    } catch (error) {
      console.error(error);
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Member not found",
          "data": null
        }
      });
    }
  }
}

export default MemberController;
