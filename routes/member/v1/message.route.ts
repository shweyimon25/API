import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import MessageController from "../../../app/controllers/member/v1/message.controller";

const router = Router();
const messageController = new MessageController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await messageController.findAll(req, res),
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        asyncHandler(
            async (req: Request, res: Response) =>
                await messageController.findOne(req, res),
        ),
    ]);

router.post("/upload-attachments", [
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        async (req: Request, res: Response) =>
            await messageController.uploadAttachments(req, res),
    )
])

export default router;
