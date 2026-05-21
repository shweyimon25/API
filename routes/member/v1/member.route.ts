import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import MemberController from "../../../app/controllers/member/v1/member.controller";

const router = Router();
const memberController = new MemberController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.getAllMembers(req, res),
    ),
  ]);

router
  .route("/common")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.findCommonAll(req, res),
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await memberController.findOne(req, res),
    ),
  ]);

export default router;
