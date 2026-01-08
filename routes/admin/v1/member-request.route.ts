import passport from "passport";
import { Request, Response, Router } from "express";
import MemberRequestController from "../../../app/controllers/admin/v1/member-request.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const memberRequestController = new MemberRequestController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['member-request:list']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await memberRequestController.findAll(req, res)
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['member-request:read']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await memberRequestController.findOne(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['member-request:update']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await memberRequestController.update(req, res)
        ),
    ])

export default router;
