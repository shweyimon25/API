import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import { gymMemberRequestSchema, trainerMemberRequestSchema } from "../../../schemas/member/v1/member-request.schema";
import MemberShipService from "../../../services/member/v1/member-request.service";
import MembershipService from "../../../services/member/v1/member-request.service";
import { Member, User } from "@prisma/client";
import { successResponse } from "../../../helpers/response";
import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  Exception,
  ForbiddenException,
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  buildTrainerRequestWhere,
  formatTrainerRequest,
  formatTrainerRequestFormData,
  parseTrainerFormBody,
  parseTrainerFormUpdateBody,
  RpcTrainerBodyUpdateParams,
  RpcTrainerRequestParams,
  trainerRequestInclude,
} from "../../../helpers/trainer-request.helper";

class MemberRequestController {
    private membershipService: MemberShipService;

    constructor() {
        this.membershipService = new MembershipService();
    }

    private rpcError(res: Response, message: string) {
        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: false,
                message,
                data: null,
            },
        });
    }

    private handleTrainerCreateError(res: Response, error: unknown) {
        if (error instanceof ValidationException) {
            const message =
                error.details?.[0]?.issue ??
                error.message ??
                "Validation failed";
            return this.rpcError(res, message);
        }

        if (
            error instanceof BadRequestException ||
            error instanceof NotFoundException ||
            error instanceof ForbiddenException ||
            error instanceof Exception
        ) {
            return this.rpcError(res, error.message);
        }

        console.error("Trainer request error:", error);
        return this.rpcError(res, "Internal server error");
    }

    async trainerRequestFormDataUpdate(req: Request, res: Response) {
        const params = parseTrainerFormUpdateBody(
            req.body as Record<string, unknown>
        );
        const memberId = (req.user as Member).id;
        const files = (req.files as Express.Multer.File[]) ?? [];

        try {
            const request = await this.membershipService.updateTrainerFromFormData(
                +req.params.trainer_id,
                params,
                files,
                memberId
            );

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    message: "Update Successfully.",
                    data: formatTrainerRequestFormData(request),
                },
            });
        } catch (error) {
            return this.handleTrainerCreateError(res, error);
        }
    }

    async trainerRequestFormDataCreate(req: Request, res: Response) {
        const params = parseTrainerFormBody(req.body as Record<string, unknown>);
        const memberId = (req.user as Member).id;
        const files = (req.files as Express.Multer.File[]) ?? [];

        try {
            const request = await this.membershipService.createTrainerFromFormData(
                params,
                files,
                memberId
            );

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: formatTrainerRequestFormData(request),
                },
            });
        } catch (error) {
            return this.handleTrainerCreateError(res, error);
        }
    }

    async trainerRequestUpdate(req: Request, res: Response) {
        const params = (req.body?.params ?? {}) as RpcTrainerBodyUpdateParams;
        const memberId = (req.user as Member).id;

        try {
            const request = await this.membershipService.updateTrainerFromRpc(
                +req.params.trainer_id,
                params,
                memberId
            );

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    message: "Update Successfully.",
                    data: formatTrainerRequestFormData(request),
                },
            });
        } catch (error) {
            return this.handleTrainerCreateError(res, error);
        }
    }

    async trainerRequestCreate(req: Request, res: Response) {
        const params = (req.body?.params ?? {}) as RpcTrainerRequestParams;
        const memberId = (req.user as Member).id;

        try {
            const request = await this.membershipService.createTrainerFromRpc(
                params,
                memberId
            );

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: formatTrainerRequest(request),
                },
            });
        } catch (error) {
            return this.handleTrainerCreateError(res, error);
        }
    }

    async trainerRequestList(req: Request, res: Response) {
        const params = req.body?.params ?? {};
        const where = buildTrainerRequestWhere(params.filters);

        const requests = await prisma.memberRequest.findMany({
            where,
            orderBy: { id: "desc" },
            include: trainerRequestInclude,
        });

        const results = requests.map((request) => formatTrainerRequest(request));

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

    async trainerMemberRequest(req: Request, res: Response) {
        const { data, error, success } = await validater(trainerMemberRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Member request failed", error);
        }

        const trainerMember = await this.membershipService.trainerMemberRequest(data, req.files as Express.Multer.File[], (req.user as User).id);
        return successResponse(res, "Trainer member request successfully", trainerMember);
    }

    async gymMemberRequest(req: Request, res: Response) {
        const { data, error, success } = await validater(gymMemberRequestSchema, req.body);

        if (!success) {
            throw new ValidationException("Member request failed", error);
        }

        const gymMemberRequest = await this.membershipService.gymMemberRequest(data, (req.user as Member).id);
        return successResponse(res, "Gym member request successfully", gymMemberRequest);
    }
}

export default MemberRequestController;