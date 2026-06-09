import { Request, Response, Router } from "express";
import ShopLevelController from "../../../app/controllers/member/v1/shop-level.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopLevelController = new ShopLevelController();

router.get("/member.type.level/list", [
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopLevelController.memberTypeLevelList(req, res)
  ),
]);

export default router;
