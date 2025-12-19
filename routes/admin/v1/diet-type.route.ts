import passport from "passport";
import { Request, Response, Router } from "express";
import DietTypeController from "../../../app/controllers/admin/v1/diet-type.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const dietTypeController = new DietTypeController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.destroy(req, res)
    ),
  ]);

export default router;

