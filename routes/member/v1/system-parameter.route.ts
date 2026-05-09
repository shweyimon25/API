import { Request, Response, Router } from "express";
import SystemParameterController from "../../../app/controllers/member/v1/system-parameter.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const systemParameterController = new SystemParameterController();

router
  .route("/info")
  .get([
    // passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await systemParameterController.findInfo(req, res)
    ),
  ]);

router
  .route("/force-update/status")
  .get([
    // passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await systemParameterController.findForceUpdateStatus(req, res)
    ),
  ]);

  router
  .route("/version-check")
  .get([
    // passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await systemParameterController.findAppVersionInfo(req, res)
    ),
  ]);


export default router;

