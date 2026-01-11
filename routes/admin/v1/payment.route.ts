import passport from "passport";
import { Request, Response, Router } from "express";
import PaymentController from "../../../app/controllers/admin/v1/payment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const paymentController = new PaymentController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['payment:list']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await paymentController.findAll(req, res)
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['payment:read']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await paymentController.findOne(req, res)
        ),
    ])
    .put([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['payment:update']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await paymentController.update(req, res)
        ),
    ])

export default router;
