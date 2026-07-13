import passport from "passport";
import { Request, Response, Router } from "express";
import TagController from "../../../app/controllers/member/v1/post-category.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const tagController = new TagController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.findAll(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.findOne(req, res)
    ),
  ]);

export default router;

