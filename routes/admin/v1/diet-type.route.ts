import passport from "passport";
import { Request, Response, Router } from "express";
import DietTypeController from "../../../app/controllers/admin/v1/diet-type.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const dietTypeController = new DietTypeController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['diet-type:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['diet-type:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await dietTypeController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['diet-type:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['diet-type:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['diet-type:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await dietTypeController.destroy(req, res)
    ),
  ]);

export default router;

