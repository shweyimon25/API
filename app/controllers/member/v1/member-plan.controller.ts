import { Request, Response } from "express";
import { Status } from "@prisma/client";
import MemberPlanService from "../../../services/member/v1/member-plan.service";
import { successResponse } from "../../../helpers/response";
import { MemberPlanResource } from "../../../resources/member/v1/member-plan/member-plan.resource";
import { MemberPlanCollection } from "../../../resources/member/v1/member-plan/member-plan.collection";
import prisma from "../../../../prisma/client";

class MemberPlanController {
    private memberPlanService: MemberPlanService;

    constructor() {
        this.memberPlanService = new MemberPlanService();
    }

    private joinLines(items: { name: string }[]) {
        return items.length ? items.map((item) => item.name).join("\n\n") : null;
    }

    private planDataType(memberTypeName: string) {
        const name = memberTypeName.toLowerCase();
        if (name.includes("trainer")) return "trainer";
        if (name.includes("shop")) return "shop";
        return "member";
    }

    private durationId(
        duration: number,
        durationMap: Map<number, number>
    ) {
        return durationMap.get(duration) ?? null;
    }

    private planImage(image: string | null | undefined) {
        return image ?? "";
    }

    async memberPlanList(req: Request, res: Response) {
        const [memberPlans, shopLevels, planDurations, shopPros, shopCons] =
            await Promise.all([
                prisma.memberPlan.findMany({
                    where: { status: Status.ACTIVE },
                    orderBy: { id: "asc" },
                    include: {
                        memberType: { select: { id: true, name: true } },
                        pros: { select: { name: true }, orderBy: { id: "asc" } },
                        cons: { select: { name: true }, orderBy: { id: "asc" } },
                    },
                }),
                prisma.shopLevel.findMany({
                    where: { status: Status.ACTIVE },
                    orderBy: { id: "asc" },
                }),
                prisma.planDuration.findMany(),
                prisma.pros.findMany({
                    where: { status: Status.ACTIVE },
                    select: { name: true },
                    orderBy: { id: "asc" },
                }),
                prisma.cons.findMany({
                    where: { status: Status.ACTIVE },
                    select: { name: true },
                    orderBy: { id: "asc" },
                }),
            ]);

        const durationMap = new Map(
            planDurations.map((duration) => [duration.value, duration.id])
        );
        const shopProsText = this.joinLines(shopPros);
        const shopConsText = this.joinLines(shopCons);

        const memberResults = memberPlans.map((plan) => {
            const image = this.planImage(plan.image);

            return {
                id: plan.id,
                member_type: plan.name,
                duration_id: this.durationId(plan.duration, durationMap),
                member_type_level_id: plan.memberTypeId,
                price: Number(plan.price),
                pros: this.joinLines(plan.pros),
                cons: this.joinLines(plan.cons),
                image_url: image,
                image,
                data_type: this.planDataType(plan.memberType.name),
                res_video_group: plan.isVideoGroup,
            };
        });

        const shopResults = shopLevels.map((level) => ({
            id: level.id,
            member_type: level.name,
            duration_id: this.durationId(level.duration, durationMap),
            member_type_level_id: level.id,
            price: Number(level.price),
            pros: shopProsText,
            cons: shopConsText,
            image_url: "",
            image: "",
            data_type: "shop",
            res_video_group: null,
        }));

        const results = [...memberResults, ...shopResults];

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data: {
                    count: results.length,
                    results,
                },
            },
        });
    }

    async findAll(req: Request, res: Response) {
        const { search, duration, memberTypeId } = req.query;

        const filters: any = {};
        if (duration) {
            filters.duration = +duration as number;
        }
        if (search) {
            filters.search = search as string;
        }
        if (memberTypeId) {
            filters.memberTypeId = +memberTypeId as number;
        }

        const memberPlans = await this.memberPlanService.findAll(filters);

        return successResponse(res,
            "Member plan list successfully",
            MemberPlanCollection.toCollection(memberPlans)
        );
    }

    async findOne(req: Request, res: Response) {
        const memberPlan = await this.memberPlanService.findOne(+req.params.id);
        return successResponse(res,
            "Member plan details successfully",
            MemberPlanResource.toResource(memberPlan)
        );
    }
}

export default MemberPlanController;