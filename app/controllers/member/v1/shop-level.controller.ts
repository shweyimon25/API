import { Request, Response } from "express";
import { Status } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import ShopLevelService from "../../../services/member/v1/shop-level.service";
import prisma from "../../../../prisma/client";

class ShopLevelController {
    private shopLevelService: ShopLevelService;

    constructor() {
        this.shopLevelService = new ShopLevelService();
    }

    private parseLevelDescription(description: string | null) {
        if (!description) {
            return { pros: null, cons: null };
        }

        try {
            const parsed = JSON.parse(description) as {
                pros?: string | null;
                cons?: string | null;
            };

            if (parsed && typeof parsed === "object") {
                return {
                    pros: parsed.pros ?? null,
                    cons: parsed.cons ?? null,
                };
            }
        } catch {
            // Plain text descriptions are treated as pros.
        }

        return { pros: description, cons: null };
    }

    private resolveDuration(
        rawDuration: number,
        planDurations: { value: number }[]
    ) {
        if (planDurations.some((duration) => duration.value === rawDuration)) {
            return rawDuration;
        }

        if (rawDuration >= 30 && rawDuration % 30 === 0) {
            return rawDuration / 30;
        }

        return rawDuration;
    }

    async memberTypeLevelList(req: Request, res: Response) {
        const [shopLevels, planDurations] = await Promise.all([
            prisma.shopLevel.findMany({
                where: { status: Status.ACTIVE },
                orderBy: { id: "asc" },
            }),
            prisma.planDuration.findMany(),
        ]);

        const results = shopLevels.map((level) => {
            const { pros, cons } = this.parseLevelDescription(level.description);

            return {
                id: level.id,
                name: level.name,
                duration: this.resolveDuration(level.duration, planDurations),
                price: Number(level.price),
                count: level.postLimit,
                pros,
                cons,
                appendix: 0,
            };
        });

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
        const shopLevels = await this.shopLevelService.findAll();
        return successResponse(res, "Shop level list successfully", shopLevels);
    }

    async findOne(req: Request, res: Response) {
        const { id } = req.params;

        const shopLevel = await this.shopLevelService.findOne(+id);

        return successResponse(res, "Shop level fetched successfully", shopLevel);
    }

    async findCommonAll(req: Request, res: Response) {
        const shopLevels = await this.shopLevelService.findCommonAll();
        return successResponse(res, "Common shop level list successfully", shopLevels);
    }
}

export default ShopLevelController;