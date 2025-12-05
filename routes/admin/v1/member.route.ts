import passport from "passport";
import { Request, Response, Router } from "express";
import MemberController from "../../../app/controllers/admin/v1/member.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const memberController = new MemberController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.destroy(req, res)
    ),
  ]);

export default router;
