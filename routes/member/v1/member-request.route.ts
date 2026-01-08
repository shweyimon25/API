import passport from "passport";
import { Request, Response, Router } from "express";
import MemberRequestController from "../../../app/controllers/member/v1/member-request.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const memberRequestController = new MemberRequestController();

router
    .route("/trainer-member")
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await memberRequestController.trainerMemberRequest(req, res)
        ),
    ]);

export default router;
