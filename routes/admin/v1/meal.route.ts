import passport from "passport";
import { Request, Response, Router } from "express";
import MealController from "../../../app/controllers/admin/v1/meal.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const mealController = new MealController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['meal:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await mealController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['meal:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await mealController.destroy(req, res)
    ),
  ]);

export default router;

