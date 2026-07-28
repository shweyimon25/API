import passport from "passport";
import { Request, Response, Router } from "express";
import ProjectController from "../../../app/controllers/admin/v1/project.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const projectController = new ProjectController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await projectController.findAll(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await projectController.create(req, res),
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await projectController.findOne(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await projectController.update(req, res),
    ),
  ]);

export default router;
