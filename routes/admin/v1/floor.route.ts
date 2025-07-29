import passport from "passport";
import { Request, Response, Router } from "express";
import FloorController from "../../../app/controllers/admin/v1/floor.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const floorController = new FloorController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await floorController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await floorController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await floorController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await floorController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await floorController.destroy(req, res)
    ),
  ]);

export default router;
