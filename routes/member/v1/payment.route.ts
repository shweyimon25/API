import passport from "passport";
import { Request, Response, Router } from "express";
import PaymentController from "../../../app/controllers/member/v1/payment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const paymentController = new PaymentController();

router.post("/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await paymentController.createPayment(req, res)
  ),
]);

export default router;
