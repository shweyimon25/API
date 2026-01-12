import passport from "passport";
import { Request, Response, Router } from "express";
import MemberTypeController from "../../../app/controllers/admin/v1/member-type.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const memberTypeController = new MemberTypeController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member-type:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberTypeController.findAll(req, res)
    ),
  ]);

router.route('/common').get([
  passport.authenticate("jwt", { session: false }),
  hasPermission(['member-type:list']),
  asyncHandler(
    async (req: Request, res: Response) =>
      await memberTypeController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['member-type:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberTypeController.findOne(req, res)
    ),
  ]);

export default router;
