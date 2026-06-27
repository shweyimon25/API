import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import WeightHistoryController from "../../../app/controllers/member/v1/weight-history.controller";

const router = Router();
const weightHistoryController = new WeightHistoryController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            weightHistoryController.getWeightHistories(req, res),
        ),
    ])

export default router;
