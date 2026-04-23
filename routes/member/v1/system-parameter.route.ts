import { Request, Response, Router } from "express";
import SystemParameterController from "../../../app/controllers/member/v1/system-parameter.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const systemParameterController = new SystemParameterController();

router
  .route("/")
  .get([
    // passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await systemParameterController.findInfo(req, res)
    ),
  ]);

export default router;

