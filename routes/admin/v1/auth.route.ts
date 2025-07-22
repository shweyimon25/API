import { Request, Response, Router } from "express";
import AuthController from "../../../app/controllers/admin/v1/auth.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const authController = new AuthController();

router.post("/sign-in", [
  asyncHandler(
    async (req: Request, res: Response) => await authController.signIn(req, res)
  ),
]);

export default router;
