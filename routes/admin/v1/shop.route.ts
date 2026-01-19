import passport from "passport";
import { Request, Response, Router } from "express";
import ShopController from "../../../app/controllers/admin/v1/shop.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const shopController = new ShopController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['shop:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.findAll(req, res)
    ),
  ]);

router.route('/common').get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await shopController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['shop:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.findOne(req, res)
    ),
  ]);

export default router;

