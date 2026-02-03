import passport from "passport";
import { Request, Response, Router } from "express";
import PostCommentController from "../../../app/controllers/member/v1/post-comment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postCommentController = new PostCommentController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCommentController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCommentController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCommentController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCommentController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await postCommentController.destroy(req, res)
    ),
  ]);

export default router;
