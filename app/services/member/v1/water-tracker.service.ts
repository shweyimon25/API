import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";
import {
    CreateWaterTrackerInput,
    MAX_DAILY_WATER,
    UpdateWaterTrackerInput,
} from "../../../schemas/member/v1/water-tracker.schema";
import { BadRequestException, NotFoundException } from "../../../helpers/exceptions";

class WaterTrackerService {
    async findAll(memberId: number, where: Prisma.WaterTrackerWhereInput = {}) {
        return prisma.waterTracker.findMany({
            where: {
                memberId,
                ...where,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findOne(memberId: number, id: number) {
        const tracker = await prisma.waterTracker.findFirst({
            where: { id, memberId },
        });

        if (!tracker) {
            throw new NotFoundException("Water tracker not found");
        }

        return tracker;
    }

    /**
     * One row per member per date (application-level upsert).
     */
    async create(memberId: number, input: CreateWaterTrackerInput) {
        const { date, dailyWater } = input;
        const amount = dailyWater ?? 0;

        if (amount > MAX_DAILY_WATER) {
            throw new BadRequestException(
                `Daily water cannot exceed ${MAX_DAILY_WATER} per day`,
            );
        }

        const existing = await prisma.waterTracker.findFirst({
            where: { memberId, date },
            orderBy: { id: "desc" },
        });

        if (existing) {
            return prisma.waterTracker.update({
                where: { id: existing.id },
                data: { dailyWater: amount },
            });
        }

        return prisma.waterTracker.create({
            data: {
                memberId,
                date,
                dailyWater: amount,
            },
        });
    }

    async update(memberId: number, id: number, input: UpdateWaterTrackerInput) {
        const existing = await this.findOne(memberId, id);
        const next =
            input.dailyWater !== undefined ? input.dailyWater : existing.dailyWater;

        if (next > MAX_DAILY_WATER) {
            throw new BadRequestException(
                `Daily water cannot exceed ${MAX_DAILY_WATER} per day`,
            );
        }

        return prisma.waterTracker.update({
            where: { id: existing.id },
            data: {
                dailyWater: next,
            },
        });
    }

    async destroy(memberId: number, id: number) {
        await this.findOne(memberId, id);

        await prisma.waterTracker.delete({
            where: { id },
        });
    }
}

export default WaterTrackerService;
