import passport from "passport";
import { Request, Response, Router } from "express";
import DeliveriableController from "../../../app/controllers/admin/v1/deliveriable.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const deliveriableController = new DeliveriableController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await deliveriableController.findAll(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await deliveriableController.create(req, res),
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await deliveriableController.findOne(req, res),
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await deliveriableController.update(req, res),
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await deliveriableController.destroy(req, res),
    ),
  ]);

export default router;
