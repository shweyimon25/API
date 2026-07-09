import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import ShopRatingController from "../../../app/controllers/member/v1/shop-rating.controller";

const router = Router();
const shopRatingController = new ShopRatingController();

router.post("/shop.rate", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopRatingController.memberShopRateList(req, res)
  ),
]);

router.post("/shop.rate/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopRatingController.memberShopRateCreate(req, res)
  ),
]);

export default router;
