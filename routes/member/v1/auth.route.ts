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

router.post("/forgot-password/request-otp", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.forgotPasswordRequestOtp(req, res)
  ),
]);

router.post("/forgot-password/verify-otp", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.forgotPasswordVerifyOtp(req, res)
  ),
]);

router.post("/forgot-password/reset-password", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.forgotPasswordResetPassword(req, res)
  ),
]);

router.post("/sign-in/google", [
  asyncHandler(
    async (req: Request, res: Response) => 
      await authController.signInWithGoogle(req, res)
  )
])

export default router;
