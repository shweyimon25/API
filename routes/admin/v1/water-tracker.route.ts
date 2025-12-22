import passport from "passport";
import { Request, Response, Router } from "express";
import WaterTrackerController from "../../../app/controllers/admin/v1/water-tracker.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const waterTrackerController = new WaterTrackerController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['water-tracker:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await waterTrackerController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['water-tracker:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await waterTrackerController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['water-tracker:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await waterTrackerController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['water-tracker:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await waterTrackerController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['water-tracker:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await waterTrackerController.destroy(req, res)
    ),
  ]);

export default router;

