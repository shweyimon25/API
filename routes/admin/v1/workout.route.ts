import passport from "passport";
import { Request, Response, Router } from "express";
import WorkoutController from "../../../app/controllers/admin/v1/workout.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const workoutController = new WorkoutController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['workout:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await workoutController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['workout:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await workoutController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['workout:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await workoutController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['workout:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await workoutController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['workout:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await workoutController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['workout:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await workoutController.destroy(req, res)
    ),
  ]);

export default router;

