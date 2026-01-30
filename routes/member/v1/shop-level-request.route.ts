import passport from "passport";
import { Request, Response, Router } from "express";
import ShopLevelRequestController from "../../../app/controllers/member/v1/shop-level-request.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopLevelRequestController = new ShopLevelRequestController();

router.post('/', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopLevelRequestController.create(req, res)
    ),
]);

export default router;

