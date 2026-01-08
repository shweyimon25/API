import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import MemberPlanController from "../../../app/controllers/member/v1/member-plan.controller";

const router = Router();
const memberPlanController = new MemberPlanController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await memberPlanController.findAll(req, res)
        ),
    ]);

router.route("/:id").get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await memberPlanController.findOne(req, res)
    )
]);

export default router;
