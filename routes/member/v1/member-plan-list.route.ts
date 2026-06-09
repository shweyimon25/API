import { Request, Response, Router } from "express";
import MemberPlanController from "../../../app/controllers/member/v1/member-plan.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const memberPlanController = new MemberPlanController();

const memberPlanListHandler = asyncHandler(
  async (req: Request, res: Response) =>
    await memberPlanController.memberPlanList(req, res)
);

router.get("/member.plan/list", [memberPlanListHandler]);
router.get("/member.plan", [memberPlanListHandler]);

export default router;
