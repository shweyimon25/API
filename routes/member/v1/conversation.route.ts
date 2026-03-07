import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import ConversationController from "../../../app/controllers/member/v1/conversation.controller";

const router = Router();
const conversationController = new ConversationController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await conversationController.findAll(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await conversationController.create(req, res)
        ),
    ]);

router.route("/common")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await conversationController.findCommonAll(req, res)
        ),
    ]);

router.post("/:id/request-accept", [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await conversationController.requestAccept(req, res)
    ),
]);

router.route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await conversationController.findOne(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await conversationController.update(req, res)
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await conversationController.destroy(req, res)
        ),
    ]);

export default router;
