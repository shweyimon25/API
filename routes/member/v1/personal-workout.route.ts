import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import WorkoutController from "../../../app/controllers/member/v1/workout.controller";

const router = Router();
const workoutController = new WorkoutController();

router.post("/personal.workout", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await workoutController.personalWorkout(req, res)
  ),
]);

export default router;
