import passport from "passport";
import { Request, Response, Router } from "express";
import CuisineController from "../../../app/controllers/admin/v1/cuisine.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const cuisineController = new CuisineController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await cuisineController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await cuisineController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await cuisineController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await cuisineController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await cuisineController.destroy(req, res)
    ),
  ]);

export default router;
