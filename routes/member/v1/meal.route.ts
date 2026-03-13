import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import MealController from "../../../app/controllers/member/v1/meal.controller";

const router = Router();
const mealController = new MealController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealController.findAll(req, res),
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) =>
            mealController.findOne(req, res),
        ),
    ]);

export default router;

