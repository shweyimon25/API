import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import BodyGoalService from "../../../services/admin/v1/body-goal.service";
import { validater } from "../../../helpers/validator";
import {
    createBodyGoalSchema,
    updateBodyGoalSchema,
} from "../../../schemas/admin/v1/body-goal.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { BodyGoalCollection } from "../../../resources/admin/v1/body-goal/body-goal.collection";
import { BodyGoalResource } from "../../../resources/admin/v1/body-goal/body-goal.resource";
import { bodyGoalScope } from "../../../scopes/admin/v1/body-goal.scope";

class BodyGoalController {
    private bodyGoalService: BodyGoalService;

    constructor() {
        this.bodyGoalService = new BodyGoalService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        const where = bodyGoalScope(req.query);

        if (page && perPage) {
            const cons = await this.bodyGoalService.findByPaginate(+page, +perPage, where);
            return successResponse(
                res,
                "Body goal list successfully",
                BodyGoalCollection.withPagination(cons)
            );
        }

        const cons = await this.bodyGoalService.findAll(where);
        return successResponse(
            res,
            "Body goal list successfully",
            BodyGoalCollection.toCollection(cons)
        );
    }

    async findCommonAll(req: Request, res: Response) {
        const where = bodyGoalScope(req.query);

        const bodyGoals = await this.bodyGoalService.findCommonAll(where);
        
        return successResponse(
            res,
            "Body goal list successfully",
            BodyGoalCollection.toCommonCollection(bodyGoals)
        );
    }

    async findOne(req: Request, res: Response) {
        const cons = await this.bodyGoalService.findOne(+req.params.id);
        return successResponse(
            res,
            "Body goal detail successfully",
            BodyGoalResource.toResource(cons)
        );
    }

    async create(req: Request, res: Response) {
        const { data, error, success } = await validater(
            createBodyGoalSchema,
            req.body
        );

        if (!success) {
            throw new ValidationException("Body goal created failed", error);
        }

        const cons = await this.bodyGoalService.create(data);

        return successResponse(
            res,
            "Cons created successfully",
            BodyGoalResource.toResource(cons)
        );
    }

    async update(req: Request, res: Response) {

        const { data, error, success } = await validater(
            updateBodyGoalSchema,
            req.body
        );

        if (!success) {
            throw new ValidationException("Body goal updated failed", error);
        }

        const cons = await this.bodyGoalService.update(+req.params.id, data);

        return successResponse(
            res,
            "Body goal updated successfully",
            BodyGoalResource.toResource(cons)
        );
    }

    async destroy(req: Request, res: Response) {
        await this.bodyGoalService.destroy(+req);
        return successResponse(res, "Body goal deleted successfully");
    }
}

export default BodyGoalController;

