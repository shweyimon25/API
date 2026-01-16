import passport from "passport";
import { Request, Response, Router } from "express";
import ShopLevelRequestController from "../../../app/controllers/admin/v1/shop-level-request.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const shopLevelRequestController = new ShopLevelRequestController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['shop-level-request:list']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopLevelRequestController.findAll(req, res)
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['shop-level-request:read']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopLevelRequestController.findOne(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['shop-level-request:update']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopLevelRequestController.update(req, res)
        ),
    ]);

export default router;
