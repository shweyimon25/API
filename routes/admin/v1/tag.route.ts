import passport from "passport";
import { Request, Response, Router } from "express";
import TagController from "../../../app/controllers/admin/v1/tag.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const tagController = new TagController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['tag:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['tag:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await tagController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['tag:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['tag:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['tag:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.destroy(req, res)
    ),
  ]);

export default router;

