import passport from "passport";
import { Request, Response, Router } from "express";
import ShopRatingController from "../../../app/controllers/member/v1/shop-rating.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const shopRatingController = new ShopRatingController();

router.get("/", [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await shopRatingController.findAll(req, res)
    ),
]
);

router.post("/",
    [
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopRatingController.create(req, res)
        ),
    ]
);

router.put("/:id",
    [
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopRatingController.update(req, res)
        ),
    ]
);

router.delete("/:id",
    [
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await shopRatingController.destroy(req, res)
        ),
    ]
);

export default router;
