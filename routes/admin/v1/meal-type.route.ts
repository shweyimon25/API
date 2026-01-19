import passport from "passport";
import { Request, Response, Router } from "express";
import MealTypeController from "../../../app/controllers/admin/v1/meal-type.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const mealTypeController = new MealTypeController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal-type:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealTypeController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal-type:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealTypeController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await mealTypeController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal-type:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealTypeController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal-type:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealTypeController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal-type:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealTypeController.destroy(req, res)
    ),
  ]);

export default router;

