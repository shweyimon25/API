import passport from "passport";
import { Request, Response, Router } from "express";
import ProficientLevelController from "../../../app/controllers/admin/v1/proficient-level.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const proficientLevelController = new ProficientLevelController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await proficientLevelController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await proficientLevelController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await proficientLevelController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await proficientLevelController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await proficientLevelController.destroy(req, res)
    ),
  ]);

export default router;
