import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";
import PostCategoryController from "../../../app/controllers/admin/v1/post-category.controller";

const router = Router();
const postCategoryController = new PostCategoryController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(["post-category:list"]),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCategoryController.findAll(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(["post-category:create"]),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCategoryController.create(req, res),
    ),
  ]);

router
  .route("/common")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCategoryController.findCommonAll(req, res),
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(["post-category:read"]),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCategoryController.findOne(req, res),
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(["post-category:update"]),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCategoryController.update(req, res),
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(["post-category:delete"]),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCategoryController.destroy(req, res),
    ),
  ]);

export default router;
