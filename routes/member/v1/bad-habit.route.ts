import passport from "passport";
import { Request, Response, Router } from "express";
import BadHabitController from "../../../app/controllers/member/v1/bad-habit.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import dietTypeController from "../../../app/controllers/member/v1/diet-type.controller";

const router = Router();
const badHabitController = new BadHabitController();

const auth = passport.authenticate("jwt", { session: false });

router.get("/", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await badHabitController.getBadHabits(req, res)
  ),
]);

export default router;
