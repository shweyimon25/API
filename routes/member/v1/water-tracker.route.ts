import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import WaterTrackerController from "../../../app/controllers/member/v1/water-tracker.controller";

const router = Router();
const waterTrackerController = new WaterTrackerController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            waterTrackerController.findAll(req, res),
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            waterTrackerController.create(req, res),
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            waterTrackerController.findOne(req, res),
        ),
    ])
    .put([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            waterTrackerController.update(req, res),
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            waterTrackerController.destroy(req, res),
        ),
    ]);

export default router;
