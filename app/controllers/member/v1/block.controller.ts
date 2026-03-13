import { Member } from "@prisma/client";
import BlockService from "../../../services/member/v1/block.service";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { ValidationException } from "../../../helpers/exceptions";
import { validater } from "../../../helpers/validator";
import { BlockSchema } from "../../../schemas/member/v1/block.schema";

class BlockController {
    private blockService: BlockService;

    constructor() {
        this.blockService = new BlockService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        const memberId = (req.user as Member).id;

        if (page && perPage) {
            const blocks = await this.blockService.findByPaginate(memberId, +page, +perPage);
            return successResponse(res, "Blocks retrieved successfully", blocks);
        }

        const blocks = await this.blockService.findAll(memberId);
        return successResponse(res, "Blocks retrieved successfully", blocks);
    }

    async findCommonAll(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const blocks = await this.blockService.findCommonAll(memberId);
        return successResponse(res, "Common blocks retrieved successfully", blocks);
    }

    async findOne(req: Request, res: Response) {
        const id = +req.params.id;
        const memberId = (req.user as Member).id;
        const block = await this.blockService.findOne(id, memberId);

        return successResponse(res,
            "Block details successfully",
            block
        );
    }

    async block(req: Request, res: Response) {
        const memberId = (req.user as Member).id;

        const { data, error, success } = await validater(BlockSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to block member", error);
        }

        const block = await this.blockService.block(memberId, data);

        return successResponse(res, "Member blocked successfully", block);
    }

    async unblock(req: Request, res: Response) {
        const id = +req.params.id;
        const memberId = (req.user as Member).id;
        await this.blockService.unblock(id, memberId);
        return successResponse(res, "Member unblocked successfully");
    }
}

export default BlockController;