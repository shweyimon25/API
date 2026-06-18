import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import MemberRequestController from "../../../app/controllers/member/v1/member-request.controller";

const router = Router();
const memberRequestController = new MemberRequestController();

router.post("/res.trainer.request/form-data/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await memberRequestController.trainerRequestFormDataCreate(req, res)
  ),
]);

router.post("/res.trainer.request/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await memberRequestController.trainerRequestCreate(req, res)
  ),
]);

router.post("/res.trainer.request", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await memberRequestController.trainerRequestList(req, res)
  ),
]);

export default router;
