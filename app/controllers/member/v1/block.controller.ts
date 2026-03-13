import { Member } from "@prisma/client";
import BlockService from "../../../services/member/v1/block.service";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { ValidationException } from "../../../helpers/exceptions";
import { validater } from "../../../helpers/validator";
import { BlockSchema } from "../../../schemas/member/v1/block.schema";
import { blockScope } from "../../../scopes/member/v1/block.scope";
import { BlockCollection } from "../../../resources/member/v1/block/block.collection";
import { BlockResource } from "../../../resources/member/v1/block/block.resource";

class BlockController {
    private blockService: BlockService;

    constructor() {
        this.blockService = new BlockService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        const memberId = (req.user as Member).id;
        const where = blockScope(req.query, memberId);

        if (page && perPage) {
            const blocks = await this.blockService.findByPaginate(memberId, +page, +perPage, where);
            return successResponse(res, "Blocks retrieved successfully", BlockCollection.withPagination(blocks));
        }

        const blocks = await this.blockService.findAll(memberId, where);
        return successResponse(res, "Blocks retrieved successfully", BlockCollection.toCollection(blocks));
    }

    async findCommonAll(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const where = blockScope(req.query, memberId);
        const blocks = await this.blockService.findCommonAll(memberId, where);
        return successResponse(res, "Common blocks retrieved successfully", BlockCollection.toCommonCollection(blocks));
    }

    async findOne(req: Request, res: Response) {
        const id = +req.params.id;
        const memberId = (req.user as Member).id;
        const block = await this.blockService.findOne(id, memberId);

        return successResponse(res,
            "Block details successfully",
            BlockResource.toResource(block)
        );
    }

    async block(req: Request, res: Response) {
        const memberId = (req.user as Member).id;

        const { data, error, success } = await validater(BlockSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to block member", error);
        }

        const block = await this.blockService.block(memberId, data);

        return successResponse(res, "Member blocked successfully", BlockResource.toResource(block));
    }

    async unblock(req: Request, res: Response) {
        const id = +req.params.id;
        const memberId = (req.user as Member).id;
        await this.blockService.unblock(id, memberId);
        return successResponse(res, "Member unblocked successfully");
    }
}

export default BlockController;