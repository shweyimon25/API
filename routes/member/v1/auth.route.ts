import { Request, Response, Router } from "express";
import AuthController from "../../../app/controllers/member/v1/auth.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const authController = new AuthController();

router.post("/sign-in", [
  asyncHandler(
    async (req: Request, res: Response) => await authController.signIn(req, res)
  ),
]);

router.post("/request-otp", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.requestOTP(req, res)
  ),
]);

router.post("/verify-otp", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.verifyOTP(req, res)
  ),
]);

router.post("/sign-up", [
  asyncHandler(
    async (req: Request, res: Response) => await authController.signUp(req, res)
  ),
]);

export default router;
