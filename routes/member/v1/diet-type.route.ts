import passport from "passport";
import { Request, Response, Router } from "express";
import DietTypeController from "../../../app/controllers/member/v1/diet-type.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const dietTypeController = new DietTypeController();

const auth = passport.authenticate("jwt", { session: false });

router.get("/", [
  auth,
  asyncHandler(
    async (req: Request, res: Response) =>
      await dietTypeController.getDietTypes(req, res)
  ),
]);

export default router;
