import passport from "passport";
import { Request, Response, Router } from "express";
import BadHabitController from "../../../app/controllers/admin/v1/bad-habit.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const badHabitController = new BadHabitController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.destroy(req, res)
    ),
  ]);

export default router;

