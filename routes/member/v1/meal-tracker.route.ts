import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import MealTrackerController from "../../../app/controllers/member/v1/meal-tracker.controller";

const router = Router();
const mealTrackerController = new MealTrackerController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealTrackerController.findAll(req, res),
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealTrackerController.create(req, res),
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealTrackerController.findOne(req, res),
        ),
    ])
    .put([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealTrackerController.update(req, res),
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealTrackerController.destroy(req, res),
        ),
    ]);

export default router;

