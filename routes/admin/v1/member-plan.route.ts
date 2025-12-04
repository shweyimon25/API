import passport from "passport";
import { Request, Response, Router } from "express";
import MemberPlanController from "../../../app/controllers/admin/v1/member-plan.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const memberPlanController = new MemberPlanController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberPlanController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberPlanController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberPlanController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberPlanController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberPlanController.destory(req, res)
    ),
  ]);

export default router;
