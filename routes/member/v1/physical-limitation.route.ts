import passport from "passport";
import { Request, Response, Router } from "express";
import PhysicalLimitationController from "../../../app/controllers/member/v1/physical-limitation.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const physicalLimitationController = new PhysicalLimitationController();

const auth = passport.authenticate("jwt", { session: false });

router.get("/", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await physicalLimitationController.getPhysicalLimitations(req, res)
  ),
]);

export default router;
