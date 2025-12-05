import passport from "passport";
import { Request, Response, Router } from "express";
import ConsController from "../../../app/controllers/admin/v1/cons.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const consController = new ConsController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.destroy(req, res)
    ),
  ]);

export default router;

