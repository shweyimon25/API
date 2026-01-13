import passport from "passport";
import { Request, Response, Router } from "express";
import CategoryController from "../../../app/controllers/admin/v1/category.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const categoryController = new CategoryController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['category:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await categoryController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['category:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await categoryController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['category:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await categoryController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['category:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await categoryController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['category:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await categoryController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['category:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await categoryController.destroy(req, res)
    ),
  ]);

export default router;
