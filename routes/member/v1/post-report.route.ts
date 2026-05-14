import passport from "passport";
import { Request, Response, Router } from "express";
import PostReportController from "../../../app/controllers/member/v1/post-report.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postReportController = new PostReportController();

router
  .route("/")
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postReportController.create(req, res)
    ),
  ]);

export default router;

