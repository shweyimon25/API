import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException } from "../../../helpers/exceptions";
import {
    CreateMealTrackerInput,
    UpdateMealTrackerInput,
} from "../../../schemas/member/v1/meal-tracker.schema";

class MealTrackerService {
    async findAll(memberId: number, where: Prisma.MealTrackerWhereInput = {}) {
        return prisma.mealTracker.findMany({
            where: {
                memberId,
                ...where,
            },
            include: {
                meal: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    async findOne(memberId: number, id: number) {
        const tracker = await prisma.mealTracker.findFirst({
            where: { id, memberId },
            include: { meal: true },
        });

        if (!tracker) {
            throw new NotFoundException("Meal tracker not found");
        }

        return tracker;
    }

    private async getActiveMeal(mealId: number) {
        const meal = await prisma.meal.findFirst({
            where: { id: mealId, status: Status.ACTIVE },
        });

        if (!meal) {
            throw new BadRequestException("Meal not found or inactive");
        }

        return meal;
    }

    private async computeTotals(mealId: number, quantity: number) {
        const meal = await this.getActiveMeal(mealId);

        return {
            totalCal: meal.cal * quantity,
            totalCarb: meal.carb * quantity,
            totalProtein: meal.protein * quantity,
            totalFat: meal.fat * quantity,
        };
    }

    async create(memberId: number, input: CreateMealTrackerInput) {
        const { mealId, date, quantity } = input;

        const totals = await this.computeTotals(mealId, quantity);

        const tracker = await prisma.mealTracker.create({
            data: {
                memberId,
                mealId,
                date,
                quantity,
                ...totals,
            },
            include: { meal: true },
        });

        return tracker;
    }

    async update(memberId: number, id: number, input: UpdateMealTrackerInput) {
        const existing = await this.findOne(memberId, id);

        const mealId = input.mealId ?? existing.mealId;
        const quantity = input.quantity ?? existing.quantity;

        const totals = await this.computeTotals(mealId, quantity);

        const tracker = await prisma.mealTracker.update({
            where: { id: existing.id },
            data: {
                mealId,
                date: input.date ?? existing.date,
                quantity,
                ...totals,
            },
            include: { meal: true },
        });

        return tracker;
    }

    async destroy(memberId: number, id: number) {
        await this.findOne(memberId, id);

        await prisma.mealTracker.delete({
            where: { id },
        });
    }
}

export default MealTrackerService;

