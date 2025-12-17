import { Request, Response, Router } from "express";
import ProfileController from "../../../app/controllers/member/v1/profile.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import passport from "passport";

const router = Router();
const profileController = new ProfileController();

router.get("/profile", [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) => await profileController.profile(req, res)
    ),
]);

router.post('/profile/update', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) => await profileController.update(req, res)
    ),
]);

router.post('/profile/change-password', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) => await profileController.changePassword(req, res)
    ),
]);

export default router;
