import { Request, Response, Router } from "express";
import PlanDurationController from "../../../app/controllers/member/v1/plan-duration.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const planDurationController = new PlanDurationController();

router.get("/data.plan.duration/list", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await planDurationController.list(req, res)
  ),
]);

export default router;
