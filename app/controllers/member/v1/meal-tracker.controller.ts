import { Request, Response } from "express";
import { Member } from "@prisma/client";
import MealTrackerService from "../../../services/member/v1/meal-tracker.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
    createMealTrackerSchema,
    updateMealTrackerSchema,
} from "../../../schemas/member/v1/meal-tracker.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { MealTrackerResource } from "../../../resources/member/v1/meal-tracker/meal-tracker.resource";
import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";

class MealTrackerController {
    private mealTrackerService: MealTrackerService;

    constructor() {
        this.mealTrackerService = new MealTrackerService();
    }
    

    async findAll(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { date } = req.query;

        const targetDate = String(date || "");

        if (!targetDate) {
            throw new ValidationException("Date is required", [
                {
                    field: "date",
                    issue: "Date is required",
                },
            ]);
        }

        const trackers = await this.mealTrackerService.findAll(memberId, { date: targetDate });

        return successResponse(
            res,
            "Meal tracker list successfully",
            MealTrackerResource.withSummary(targetDate, trackers),
        );
    }

    async findOne(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { id } = req.params;

        const tracker = await this.mealTrackerService.findOne(memberId, +id);

        return successResponse(
            res,
            "Meal tracker found successfully",
            MealTrackerResource.toItem(tracker),
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createMealTrackerSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to create meal tracker", error);
        }

        const memberId = (req.user as Member).id;
        const tracker = await this.mealTrackerService.create(memberId, data);

        return successResponse(
            res,
            "Meal tracker created successfully",
            MealTrackerResource.toItem(tracker),
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateMealTrackerSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update meal tracker", error);
        }

        const memberId = (req.user as Member).id;
        const { id } = req.params;

        const tracker = await this.mealTrackerService.update(memberId, +id, data);

        return successResponse(
            res,
            "Meal tracker updated successfully",
            MealTrackerResource.toItem(tracker),
        );
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const { id } = req.params;

        await this.mealTrackerService.destroy(memberId, +id);

        return successResponse(res, "Meal tracker deleted successfully");
    }

    // Odoo Domain Filters 
    private filterValue(filters: unknown, fieldName: string, operator: string = "=") {
        const filtersStr =
            typeof filters === "string" ? filters : JSON.stringify(filters ?? "[]");
        
        const tupleRe =
            /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;

        let match: RegExpExecArray | null;
        while ((match = tupleRe.exec(filtersStr)) !== null) {
            const field = match[1];
            const op = match[2];
            const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");
            
            if (field === fieldName && op === operator) {
                return value;
            }
        }
        return null;
    }

    // Response Format
    private formatMealTracker(tracker: any) {
        return {
            id: tracker.id,
            partner_id: tracker.memberId,
            meal_id: tracker.meal ? {
                id: tracker.meal.id,
                name: tracker.meal.name,
                cal: tracker.meal.cal ?? 0.0,
                carb: tracker.meal.carb ?? 0.0,
                protein: tracker.meal.protein ?? 0.0,
                fat: tracker.meal.fat ?? 0.0,
                meal_type: tracker.meal.mealType ?? "Breakfast"
            } : null,
            count: tracker.quantity,
            date: tracker.date
        };
    }

    // ၃။ Main List Method
    async getMealTrackersList(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const filters = params.filters;

        // Pagination 
        const offset = params.offset !== undefined && params.offset !== null ? Math.max(0, Number(params.offset)) : undefined;
        const limit = params.limit !== undefined && params.limit !== null ? Math.min(100, Math.max(1, Number(params.limit))) : undefined;

        // Filters 
        const partnerIdStr = this.filterValue(filters, "partner_id", "=");
        const exactDate = this.filterValue(filters, "date", "=");
        const startDate = this.filterValue(filters, "date", ">=");
        const endDate = this.filterValue(filters, "date", "<=");

        // Prisma Where Condition 
        const where: Prisma.MealTrackerWhereInput = {};

        // Partner ID (Member ID)
        if (partnerIdStr) {
            const partnerId = Number(partnerIdStr);
            if (Number.isInteger(partnerId) && partnerId > 0) {
                where.memberId = partnerId;
            }
        }

        // Date Filter Handle 
        if (exactDate) {
            where.date = exactDate;
        } else if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = startDate;
            if (endDate) where.date.lte = endDate;
        }

        const queryOptions: any = {
            where,
            include: {
                meal: true 
            },
            orderBy: { id: "asc" }
        };

        if (offset !== undefined) queryOptions.skip = offset;
        if (limit !== undefined) queryOptions.take = limit;

        try {
            const [count, trackers] = await Promise.all([
                prisma.mealTracker.count({ where }),
                prisma.mealTracker.findMany(queryOptions)
            ]);

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: {
                        count,
                        results: trackers.map(tracker => this.formatMealTracker(tracker))
                    }
                }
            });

        } catch (error: any) {
            console.error("Fetch meal trackers error:", error);
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: error.message || "Internal server error",
                    data: null
                }
            });
        }
    }
    
    async createMealTracker(req: any, res: Response) {
        const memberId = (req.user as Member).id;

        if (!memberId) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Unauthorized. Please login first.",
                    data: null
                }
            });
        }

        const params = req.body?.params ?? {};
        const mealId = Number(params.meal_id);
        const count = Math.max(1, Number(params.count) || 1);

        if (!mealId) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "meal_id is required",
                    data: null
                }
            });
        }

        try {
            const meal = await prisma.meal.findUnique({
                where: { id: mealId }
            });

            if (!meal) {
                return res.json({
                    jsonrpc: "2.0",
                    id: null,
                    result: {
                        isFullFilled: false,
                        message: "Meal not found",
                        data: null
                    }
                });
            }

            const today = new Date();
            today.setHours(today.getHours() + 6);
            today.setMinutes(today.getMinutes() + 30);
            const todayStr = today.toISOString().split('T')[0]; // Output: "2026-06-09" 

            const totalCal = (meal.cal ?? 0) * count;
            const totalCarb = (meal.carb ?? 0) * count;
            const totalProtein = (meal.protein ?? 0) * count;
            const totalFat = (meal.fat ?? 0) * count;

            const newTracker = await prisma.mealTracker.create({
                data: {
                    memberId: memberId,
                    mealId: mealId,
                    date: todayStr,
                    quantity: count,
                    totalCal: totalCal,
                    totalCarb: totalCarb,
                    totalProtein: totalProtein,
                    totalFat: totalFat
                },
                include: {
                    meal: true 
                }
            });

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: {
                        id: newTracker.id,
                        partner_id: newTracker.memberId,
                        meal_id: {
                            id: newTracker.meal.id,
                            name: newTracker.meal.name,
                            meal_type: newTracker.meal.mealType ?? "Breakfast",
                            carb: newTracker.meal.carb ?? 0.0,
                            protein: newTracker.meal.protein ?? 0.0,
                            fat: newTracker.meal.fat ?? 0.0,
                            cal: newTracker.meal.cal ?? 0.0,
                            
                        },
                        count: newTracker.quantity,
                        date: newTracker.date
                    }
                }
            });

        } catch (error: any) {
            console.error("Create meal tracker error:", error);
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: error.message || "Internal server error",
                    data: null
                }
            });
        }
    }

    async createMultiMealTrackers(req: any, res: Response) {
        const memberId = req.user?.id;

        if (!memberId) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Unauthorized. Please login first.",
                    data: null
                }
            });
        }

        const paramsList = req.body?.params.meal_info_line;
        
        if (!Array.isArray(paramsList) || paramsList.length === 0) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Params must be a non-empty array",
                    data: null
                }
            });
        }

        try {
            const today = new Date();
            today.setHours(today.getHours() + 6);
            today.setMinutes(today.getMinutes() + 30);
            const todayStr = today.toISOString().split('T')[0]; // Output: "2026-06-09" 
            
            const createdResults = [];

            for (const item of paramsList) {
                const mealId = Number(item.meal_id);
                const count = Math.max(1, Number(item.count) || 1);

                if (!mealId) continue; 

                const meal = await prisma.meal.findUnique({
                    where: { id: mealId }
                });

                if (!meal) continue; 

                const totalCal = (meal.cal ?? 0) * count;
                const totalCarb = (meal.carb ?? 0) * count;
                const totalProtein = (meal.protein ?? 0) * count;
                const totalFat = (meal.fat ?? 0) * count;

                const newTracker = await prisma.mealTracker.create({
                    data: {
                        memberId: memberId,
                        mealId: mealId,
                        date: todayStr,
                        quantity: count,
                        totalCal,
                        totalCarb,
                        totalProtein,
                        totalFat
                    },
                    include: {
                        meal: true
                    }
                });

                createdResults.push({
                    id: newTracker.id,
                    partner_id: newTracker.memberId,
                    meal_id: {
                        id: newTracker.meal.id,
                        name: newTracker.meal.name,
                        meal_type: newTracker.meal.mealType ?? "Breakfast",
                        carb: newTracker.meal.carb ?? 0.0,
                        protein: newTracker.meal.protein ?? 0.0,
                        fat: newTracker.meal.fat ?? 0.0,
                        cal: newTracker.meal.cal ?? 0.0,
                        
                    },
                    count: newTracker.quantity,
                    date: newTracker.date
                });
            }

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: createdResults 
                }
            });

        } catch (error: any) {
            console.error("Create multi meal trackers error:", error);
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: error.message || "Internal server error",
                    data: null
                }
            });
        }
    }
}

export default MealTrackerController;

