import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import BankInformationController from "../../../app/controllers/member/v1/bank-information.controller";

const router = Router();
const bankInformationController = new BankInformationController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bankInformationController.findAll(req, res)
    ),
  ]);

router.route("/:id").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await bankInformationController.findOne(req, res)
  ),
]);

export default router;
