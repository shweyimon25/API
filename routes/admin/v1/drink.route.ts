import passport from "passport";
import { Request, Response, Router } from "express";
import DrinkController from "../../../app/controllers/admin/v1/drink.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const drinkController = new DrinkController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await drinkController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await drinkController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await drinkController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await drinkController.update(req, res)
    ),
  ]).delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await drinkController.destroy(req, res)
    ),
  ]);

export default router;
