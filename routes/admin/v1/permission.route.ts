import passport from "passport";
import { Request, Response, Router } from "express";
import PermissionController from "../../../app/controllers/admin/v1/permission.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const permissionController = new PermissionController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['permission:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await permissionController.findAll(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await permissionController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['permission:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await permissionController.findOne(req, res)
    ),
  ]);

export default router;
