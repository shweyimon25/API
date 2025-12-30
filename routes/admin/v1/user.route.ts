import passport from "passport";
import { Request, Response, Router } from "express";
import UserController from "../../../app/controllers/admin/v1/user.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const userController = new UserController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['user:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await userController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['user:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await userController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['user:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await userController.findCommonAll(req, res)
  ),
])

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['user:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await userController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['user:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await userController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['user:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await userController.destroy(req, res)
    ),
  ]);

export default router;
