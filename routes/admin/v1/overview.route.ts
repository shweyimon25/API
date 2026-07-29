import passport from "passport";
import { Request, Response, Router } from "express";
import OverviewController from "../../../app/controllers/admin/v1/overview.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const overviewController = new OverviewController();

router.get("/", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await overviewController.stats(req, res),
  ),
]);

export default router;
