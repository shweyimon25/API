import passport from "passport";
import { Request, Response, Router } from "express";
import ProfileController from "../../../app/controllers/admin/v1/profile.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const profileController = new ProfileController();

router.get("/me", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) => await profileController.me(req, res),
  ),
]);

router.post("/me", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await profileController.updateMe(req, res),
  ),
]);

export default router;
