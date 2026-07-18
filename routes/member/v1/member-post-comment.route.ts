import passport from "passport";
import { Request, Response, Router } from "express";
import PostCommentController from "../../../app/controllers/member/v1/member-post-comment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const postCommentController = new PostCommentController();


export default router;
