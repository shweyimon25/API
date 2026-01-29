import passport from "passport";
import { Request, Response, Router } from "express";
import ShopPostController from "../../../app/controllers/member/v1/shop-post.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopPostController = new ShopPostController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostController.findAll(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostController.create(req, res)
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostController.findOne(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostController.update(req, res)
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostController.destroy(req, res)
        ),
    ]);

export default router;
