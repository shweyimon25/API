import passport from "passport";
import { Request, Response, Router } from "express";
import PostController from "../../../app/controllers/member/v1/member-social-post.controller";
import PostReactionController from "../../../app/controllers/member/v1/post-reaction.controller";
import PostCommentController from "../../../app/controllers/member/v1/post-comment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postController = new PostController();
const postReactionController = new PostReactionController();
const postCommentController = new PostCommentController();

const auth = passport.authenticate("jwt", { session: false });

router.post("/member.social.post", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPosts(req, res),
  ),
]);

router.post("/member.social.post/create", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostCreate(req, res),
  ),
]);

router.post("/member.social.post/form-data/create", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostCreate(req, res),
  ),
]);

// router.post("/member.post.save/create", [
//   auth,
//   asyncHandler(
//     async (req: Request, res: Response) =>
//       await postController.memberPostSaveCreate(req, res),
//   ),
// ]);

// router.post("/member.post.save/:id/delete", [
//   auth,
//   asyncHandler(
//     async (req: Request, res: Response) =>
//       await postController.memberPostSaveDelete(req, res),
//   ),
// ]);

router.get("/member.post.react", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postReactionController.memberPostReacts(req, res),
  ),
]);

router.post("/member.post.react/check", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postReactionController.memberPostReactCheck(req, res),
  ),
]);

router.post("/member.post.comment", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostComments(req, res),
  ),
]);

router.post("/member.post.comment/create", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostCommentCreate(req, res),
  ),
]);

router.post("/member.post.comment/:id/update", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostCommentUpdate(req, res),
  ),
]);

router.post("/member.post.comment/:id/delete", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postCommentController.memberPostCommentDelete(req, res),
  ),
]);

router.post("/member.social.post/form-data/:id/update", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostUpdate(req, res),
  ),
]);

router.post("/member.social.post/:id/delete", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await postController.memberSocialPostDelete(req, res),
  ),
]);

// router
//   .route("/member.social.post/:id")
//   .get([
//     auth,
//     asyncHandler(
//       async (req: Request, res: Response) =>
//         await postController.memberSocialPostDetail(req, res),
//     ),
//   ])
//   .post([
//     auth,
//     asyncHandler(
//       async (req: Request, res: Response) =>
//         await postController.memberSocialPostDetail(req, res),
//     ),
//   ]);

export default router;
