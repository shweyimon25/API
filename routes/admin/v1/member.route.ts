import passport from "passport";
import { Request, Response, Router } from "express";
import MemberController from "../../../app/controllers/admin/v1/member.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const memberController = new MemberController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.create(req, res)
    ),
  ]);

router.route('/common').get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await memberController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.destroy(req, res)
    ),
  ]);

export default router;
