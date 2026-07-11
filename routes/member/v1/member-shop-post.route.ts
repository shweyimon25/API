import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import ShopPostController from "../../../app/controllers/member/v1/shop-post.controller";

const router = Router();
const shopPostController = new ShopPostController();

router.post("/member.shop.post", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopPostController.memberShopPosts(req, res)
  ),
]);

router.post("/member.shop.post/create", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopPostController.memberShopPostCreate(req, res)
  ),
]);

router.post("/member.shop.post/update", [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopPostController.memberShopPostUpdate(req, res)
  ),
]);

export default router;
