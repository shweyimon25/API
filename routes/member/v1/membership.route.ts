import passport from "passport";
import { Request, Response, Router } from "express";
import MembershipController from "../../../app/controllers/member/v1/membership.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const membershipController = new MembershipController();

router
    .route("/trainer-member-request")
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await membershipController.trainerMemberRequest(req, res)
        ),
    ]);

export default router;
