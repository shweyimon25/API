import passport from "passport";
import { Request, Response, Router } from "express";
import PostViewsController from "../../../app/controllers/member/v1/post-views.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postViewsController = new PostViewsController();

const auth = passport.authenticate("jwt", { session: false });

router.get("/member.post.views", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postViewsController.memberPostViews(req, res)
  ),
]);

router.post("/member.post.views/check", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postViewsController.memberPostViewsCheck(req, res)
  ),
]);


export default router;
