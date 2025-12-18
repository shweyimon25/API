import passport from "passport";
import { Request, Response, Router } from "express";
import BodyAttentionAreaController from "../../../app/controllers/admin/v1/body-attention-area.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const bodyAttentionAreaController = new BodyAttentionAreaController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bodyAttentionAreaController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bodyAttentionAreaController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bodyAttentionAreaController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bodyAttentionAreaController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bodyAttentionAreaController.destroy(req, res)
    ),
  ]);

export default router;

