import passport from "passport";
import { Request, Response, Router } from "express";
import ShopPostCommentController from "../../../app/controllers/member/v1/shop-post-comment.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopPostCommentController = new ShopPostCommentController();


router.route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostCommentController.findAll(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostCommentController.create(req, res)
        ),
    ]);

router.route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostCommentController.findOne(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostCommentController.update(req, res)
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopPostCommentController.destroy(req, res)
        ),
    ]);

export default router;
