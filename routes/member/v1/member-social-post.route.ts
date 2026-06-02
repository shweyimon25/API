import passport from "passport";
import { Request, Response, Router } from "express";
import PostController from "../../../app/controllers/member/v1/post.controller";
import PostReactionController from "../../../app/controllers/member/v1/post-reaction.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postController = new PostController();
const postReactionController = new PostReactionController();

const auth = passport.authenticate("jwt", { session: false });

router.post("/member.social.post", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPosts(req, res)
  ),
]);

router.post("/member.social.post/create", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostCreate(req, res)
  ),
]);

router.post("/member.social.post/form-data/create", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostCreate(req, res)
  ),
]);

router.post("/member.post.save/create", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberPostSaveCreate(req, res)
  ),
]);

router.post("/member.post.save/:id/delete", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberPostSaveDelete(req, res)
  ),
]);

router.get("/member.post.react", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postReactionController.memberPostReacts(req, res)
  ),
]);

router.post("/member.post.react/check", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postReactionController.memberPostReactCheck(req, res)
  ),
]);

router.post("/member.social.post/form-data/:id/update", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostUpdate(req, res)
  ),
]);

router.post("/member.social.post/:id/delete", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostDelete(req, res)
  ),
]);

router
  .route("/member.social.post/:id")
  .get([
    auth,
    asyncHandler(
      async (req: Request, res: Response) =>
        await postController.memberSocialPostDetail(req, res)
    ),
  ])
  .post([
    auth,
    asyncHandler(
      async (req: Request, res: Response) =>
        await postController.memberSocialPostDetail(req, res)
    ),
  ]);

export default router;
