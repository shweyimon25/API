import passport from "passport";
import { Request, Response, Router } from "express";
import FriendController from "../../../app/controllers/member/v1/friend.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const friendController = new FriendController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendController.findAll(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendController.findOne(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendController.destroy(req, res)
    ),
  ]);

export default router;
