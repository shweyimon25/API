import passport from "passport";
import { Request, Response, Router } from "express";
import PostController from "../../../app/controllers/admin/v1/post.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const postController = new PostController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['post:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postController.findAll(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['post:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postController.findOne(req, res)
    ),
  ]);

export default router;

