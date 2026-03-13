import passport from "passport";
import { Request, Response, Router } from "express";
import BlockController from "../../../app/controllers/member/v1/block.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const blockController = new BlockController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await blockController.findAll(req, res)
        ),
    ]);

router.route('/common').get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await blockController.findCommonAll(req, res)
    ),
]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await blockController.findOne(req, res)
        ),
    ]);

router
    .route("/")
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await blockController.block(req, res)
        ),
    ]);

router
    .route("/unblock/:id")
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await blockController.unblock(req, res)
        ),
    ]);

export default router;
