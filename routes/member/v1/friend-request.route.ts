import passport from "passport";
import { Request, Response, Router } from "express";
import FriendRequestController from "../../../app/controllers/member/v1/friend-request.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const friendRequestController = new FriendRequestController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendRequestController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendRequestController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendRequestController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendRequestController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await friendRequestController.destroy(req, res)
    ),
  ]);

export default router;
