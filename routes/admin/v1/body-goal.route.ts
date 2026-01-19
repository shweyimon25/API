import passport from "passport";
import { Request, Response, Router } from "express";
import BodyGoalController from "../../../app/controllers/admin/v1/body-goal.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const bodyGoalController = new BodyGoalController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['body-goal:list']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await bodyGoalController.findAll(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['body-goal:create']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await bodyGoalController.create(req, res)
        ),
    ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await bodyGoalController.findCommonAll(req, res)
  ),
]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['body-goal:read']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await bodyGoalController.findOne(req, res)
        ),
    ])
    .put([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['body-goal:update']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await bodyGoalController.update(req, res)
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['body-goal:delete']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await bodyGoalController.destroy(req, res)
        ),
    ]);

export default router;

