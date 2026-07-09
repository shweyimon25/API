import passport from "passport";
import { Request, Response, Router } from "express";
import ShopRatingController from "../../../app/controllers/member/v1/shop-rating.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopRatingController = new ShopRatingController();

export default router;
