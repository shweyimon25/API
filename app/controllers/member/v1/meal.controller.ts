import { Request, Response } from "express";
import { Status } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import { mealScope } from "../../../scopes/member/v1/meal.scope";
import { MealCollection } from "../../../resources/member/v1/meal/meal.collection";
import { MealResource } from "../../../resources/member/v1/meal/meal.resource";
import MealService from "../../../services/member/v1/meal.service";

class MealController {
    private mealService: MealService;

    constructor() {
        this.mealService = new MealService();
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