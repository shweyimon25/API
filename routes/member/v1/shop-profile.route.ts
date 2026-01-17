import passport from "passport";
import { Request, Response, Router } from "express";
import ShopProfileController from "../../../app/controllers/member/v1/shop-profile.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopProfileController = new ShopProfileController();

router.get('/', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopProfileController.profile(req, res)
    ),
]);

router.post('/new', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopProfileController.create(req, res)
    ),
]);

router.post('/update', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopProfileController.update(req, res)
    ),
]);

router.post('/upgrade', [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopProfileController.upgrade(req, res)
    ),
])

export default router;

