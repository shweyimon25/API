import passport from "passport";
import { Request, Response, Router } from "express";
import TagController from "../../../app/controllers/admin/v1/tag.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const tagController = new TagController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await tagController.destroy(req, res)
    ),
  ]);

export default router;

