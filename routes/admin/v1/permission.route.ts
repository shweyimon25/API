import passport from "passport";
import { Request, Response, Router } from "express";
import PermissionController from "../../../app/controllers/admin/v1/permission.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const permissionController = new PermissionController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await permissionController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await permissionController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await permissionController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await permissionController.update(req, res)
    ),
  ]);

export default router;
