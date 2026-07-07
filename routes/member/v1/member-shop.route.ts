import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import ShopController from "../../../app/controllers/member/v1/shop.controller";

const router = Router();
const shopController = new ShopController();

router.post("/member.shop/:id/update", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopController.memberShopUpdate(req, res)
  ),
]);

router.post("/member.shop/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopController.memberShopCreate(req, res)
  ),
]);

router.post("/member.shop", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopController.memberShopList(req, res)
  ),
]);

router.post("/member.shop/result/check", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopController.memberShopResultCheck(req, res)
  ),
]);

export default router;
