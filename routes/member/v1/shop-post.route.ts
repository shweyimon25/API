import passport from "passport";
import { Request, Response, Router } from "express";
import ShopPostController from "../../../app/controllers/member/v1/shop-post.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopPostController = new ShopPostController();

router.route("/:id").get([
    passport.authenticate("jwt", { session: false }),
])

export default router;
