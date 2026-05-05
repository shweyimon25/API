import { Request, Response, Router } from "express";
import AuthController from "../../../app/controllers/member/v1/auth.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const authController = new AuthController();

router.post("/login", [
  asyncHandler(
    async (req: Request, res: Response) => await authController.login(req, res)
  ),
]);

router.post("/register", [
  asyncHandler(
    asyncHandler(
      async (req: Request, res: Response) =>
        await authController.register(req, res)
    )
  )
]);

router.post("/otp/validate", [
  asyncHandler(
    asyncHandler(
      async (req: Request, res: Response) =>
        await authController.otpValidate(req, res)
    )
  )
])

// router.post("/request-otp", [
//   asyncHandler(
//     async (req: Request, res: Response) =>
//       await authController.requestOTP(req, res)
//   ),
// ]);

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
]);

router.post("/sign-in/facebook", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.signInWithFacebook(req, res)
  )
]);

router.post("/sso/login", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.SSOLogin(req, res)
  )
]);

router.post("/firebase/update_token", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await authController.updateToken(req, res)
  )
]);
export default router;
