import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import ShopController from "../../../app/controllers/member/v1/shop.controller";

const router = Router();
const shopController = new ShopController();

router.get('/', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopController.findAll(req, res)
    ),
]);

router.get('/:id', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopController.findOne(req, res)
    ),
]);

export default router;

