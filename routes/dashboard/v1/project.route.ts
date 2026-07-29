import passport from "passport";
import { Request, Response, Router } from "express";
import ProjectController from "../../../app/controllers/dashboard/v1/project.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const projectController = new ProjectController();

router
  .route("/")
  .get([
    asyncHandler(
      async (req: Request, res: Response) =>
        await projectController.findAll(req, res),
    ),
  ]);

router
  .route("/:id")
  .get([
    asyncHandler(
      async (req: Request, res: Response) =>
        await projectController.findOne(req, res),
    ),
  ])
  .post([
    asyncHandler(
      asyncHandler
    )
  ])

export default router;
