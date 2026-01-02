import passport from "passport";
import { Request, Response, Router } from "express";
import ProsController from "../../../app/controllers/admin/v1/pros.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const prosController = new ProsController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['pro:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await prosController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['pro:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await prosController.create(req, res)
    ),
  ]);

router.route('/common').get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['pro:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await prosController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['pro:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await prosController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['pro:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await prosController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['pro:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await prosController.destroy(req, res)
    ),
  ]);

export default router;

