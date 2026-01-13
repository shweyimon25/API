import passport from "passport";
import { Request, Response, Router } from "express";
import BadHabitController from "../../../app/controllers/admin/v1/bad-habit.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const badHabitController = new BadHabitController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['bad-habit:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['bad-habit:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['bad-habit:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await badHabitController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['bad-habit:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['bad-habit:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['bad-habit:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await badHabitController.destroy(req, res)
    ),
  ]);

export default router;

