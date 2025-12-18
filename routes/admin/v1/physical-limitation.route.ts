import passport from "passport";
import { Request, Response, Router } from "express";
import PhysicalLimitationController from "../../../app/controllers/admin/v1/physical-limitation.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const physicalLimitationController = new PhysicalLimitationController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.destroy(req, res)
    ),
  ]);

export default router;

