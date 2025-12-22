import passport from "passport";
import { Request, Response, Router } from "express";
import PlaceController from "../../../app/controllers/admin/v1/place.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const placeController = new PlaceController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['place:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await placeController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['place:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await placeController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['place:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await placeController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['place:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await placeController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['place:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await placeController.destroy(req, res)
    ),
  ]);

export default router;
