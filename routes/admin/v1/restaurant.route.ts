import passport from "passport";
import { Request, Response, Router } from "express";
import RestaurantController from "../../../app/controllers/admin/v1/restaurant.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const restaurantController = new RestaurantController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await restaurantController.findAll(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await restaurantController.create(req, res)
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await restaurantController.findOne(req, res)
        ),
    ])
    .put([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await restaurantController.update(req, res)
        ),
    ]);

export default router;
