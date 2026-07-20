import passport from "passport";
import { Request, Response, Router } from "express";
import PostCommentController from "../../../app/controllers/member/v1/member-social-post-comment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postCommentController = new PostCommentController();

router.post("/member.post.comment", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostComments(req, res),
  ),
]);

router.post("/member.post.comment/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostCommentCreate(req, res),
  ),
]);

router.post("/member.post.comment/:id/update", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostCommentUpdate(req, res),
  ),
]);

router.post("/member.post.comment/:id/delete", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostCommentDelete(req, res),
  ),
]);

export default router;
