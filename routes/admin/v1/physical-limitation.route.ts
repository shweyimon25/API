import passport from "passport";
import { Request, Response, Router } from "express";
import PhysicalLimitationController from "../../../app/controllers/admin/v1/physical-limitation.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const physicalLimitationController = new PhysicalLimitationController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['physical-limitation:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['physical-limitation:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['physical-limitation:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['physical-limitation:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['physical-limitation:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await physicalLimitationController.destroy(req, res)
    ),
  ]);

export default router;

