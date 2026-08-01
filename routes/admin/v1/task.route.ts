import passport from "passport";
import { Request, Response, Router } from "express";
import TaskController from "../../../app/controllers/admin/v1/task.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const taskController = new TaskController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await taskController.findAll(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await taskController.create(req, res),
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await taskController.findOne(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await taskController.update(req, res),
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await taskController.destroy(req, res),
    ),
  ]);

export default router;
