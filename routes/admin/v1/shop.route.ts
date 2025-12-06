import passport from "passport";
import { Request, Response, Router } from "express";
import ShopController from "../../../app/controllers/admin/v1/shop.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopController = new ShopController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await shopController.destroy(req, res)
    ),
  ]);

export default router;

