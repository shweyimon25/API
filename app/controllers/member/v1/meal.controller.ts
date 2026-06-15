import { Request, Response } from "express";
import { Status } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import { mealScope } from "../../../scopes/member/v1/meal.scope";
import { MealCollection } from "../../../resources/member/v1/meal/meal.collection";
import { MealResource } from "../../../resources/member/v1/meal/meal.resource";
import MealService from "../../../services/member/v1/meal.service";
import prisma from "../../../../prisma/client";

class MealController {
    private mealService: MealService;

    constructor() {
        this.mealService = new MealService();
    }

    // Prepare response format
    private formatResponse(meal: {
            id: number;
            name: string;
            cal: number;
            carb: number;
            protein: number;
            fat: number;
            mealType: string | null;
        }) {
            return {
                id: meal.id,
                name: meal.name,
                cal: meal.cal ?? 0.0,
                carb: meal.carb ?? 0.0,
                protein: meal.protein ?? 0.0,
                fat: meal.fat ?? 0.0,
                meal_type: meal.mealType ?? "Breakfast" 
            };
        }

    // Get all meal lists with pagination
    async getMealsList(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const offset = params.offset !== undefined && params.offset !== null ? Math.max(0, Number(params.offset)) : undefined;
        const limit = params.limit !== undefined && params.limit !== null ? Math.min(100, Math.max(1, Number(params.limit))) : undefined;

        const queryOptions: any = {
            orderBy: { id: "asc" }
        };

        if (offset !== undefined) queryOptions.skip = offset;
        if (limit !== undefined) queryOptions.take = limit;

        try {
            const [count, meals] = await Promise.all([
                prisma.meal.count(),
                prisma.meal.findMany(queryOptions) 
            ]);

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: {
                        count,
                        results: meals.map(meal => this.formatResponse(meal))
                    }
                }
            });

        } catch (error: any) {
            console.error("Fetch food list error:", error);
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

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        const baseWhere = mealScope(req.query as any);
        const where = {
            ...baseWhere,
            status: Status.ACTIVE,
        };

        if (page && perPage) {
            const meals = await this.mealService.findByPaginate(+page, +perPage, where);
            return successResponse(
                res,
                "Meal list successfully",
                MealCollection.withPagination(meals),
            );
        }

        const meals = await this.mealService.findAll(where);
        return successResponse(
            res,
            "Meal list successfully",
            MealCollection.toCollection(meals),
        );
    }

    async findCommonAll(req: Request, res: Response) {
        const meals = await this.mealService.findCommonAll();
        return successResponse(
            res,
            "Meal list successfully",
            MealCollection.toCommonCollection(meals),
        );
    }

    async findOne(req: Request, res: Response) {
        const meal = await this.mealService.findOne(+req.params.id);
        return successResponse(
            res,
            "Meal details successfully",
            MealResource.toResource(meal),
        );
    }
}

export default MealController;