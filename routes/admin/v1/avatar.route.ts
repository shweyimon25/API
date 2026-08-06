import passport from "passport";
import { Request, Response, Router } from "express";
import AvatarController from "../../../app/controllers/admin/v1/avatar.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const avatarController = new AvatarController();

router.get("/", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await avatarController.findAll(req, res),
  ),
]);

export default router;
