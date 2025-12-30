import passport from "passport";
import { Request, Response, Router } from "express";
import RoleController from "../../../app/controllers/admin/v1/role.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const roleController = new RoleController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['role:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await roleController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['role:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await roleController.create(req, res)
    ),
  ]);

router.route('/common').get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['role:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await roleController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['role:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await roleController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['role:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await roleController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['role:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await roleController.destroy(req, res)
    ),
  ]);

export default router;
