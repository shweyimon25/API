import passport from "passport";
import { Request, Response, Router } from "express";
import ShopPostReactionController from "../../../app/controllers/member/v1/shop-post-reaction.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const controller = new ShopPostReactionController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) => await controller.findAll(req, res)),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) => await controller.create(req, res)),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) => await controller.findOne(req, res)),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(async (req: Request, res: Response) => await controller.destroy(req, res)),
    ]);

export default router;
