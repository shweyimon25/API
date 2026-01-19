import passport from "passport";
import { Request, Response, Router } from "express";
import ShopLevelController from "../../../app/controllers/admin/v1/shop-level.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const shopLevelController = new ShopLevelController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['shop-level:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopLevelController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['shop-level:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopLevelController.create(req, res)
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
    hasPermission(['shop-level:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopLevelController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['shop-level:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopLevelController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['shop-level:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopLevelController.destory(req, res)
    ),
  ]);

export default router;

