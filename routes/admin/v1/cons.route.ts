import passport from "passport";
import { Request, Response, Router } from "express";
import ConsController from "../../../app/controllers/admin/v1/cons.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const consController = new ConsController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['con:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['con:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.create(req, res)
    ),
  ]);

router.route('/common').get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['con:list']),
  asyncHandler(
    async (req: Request, res: Response) => await consController.findCommonAll(req, res)
  )
])

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['con:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['con:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['con:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await consController.destroy(req, res)
    ),
  ]);

export default router;

