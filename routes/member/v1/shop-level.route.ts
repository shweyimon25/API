import passport from "passport";
import { Request, Response, Router } from "express";
import ShopLevelController from "../../../app/controllers/member/v1/shop-level.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopLevelController = new ShopLevelController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopLevelController.findAll(req, res)
        ),
    ]);

router.route('/common').get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopLevelController.findCommonAll(req, res)
    ),
]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopLevelController.findOne(req, res)
        ),
    ]);

export default router;

