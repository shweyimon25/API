import passport from "passport";
import { Request, Response, Router } from "express";
import WorkoutController from "../../../app/controllers/member/v1/workout.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const workoutController = new WorkoutController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await workoutController.findAll(req, res)
        ),
    ]);

router.route("/common").get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await workoutController.findCommonAll(req, res)
    ),
]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await workoutController.findOne(req, res)
        ),
    ]);

export default router;
