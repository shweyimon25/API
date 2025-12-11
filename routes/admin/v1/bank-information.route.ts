import passport from "passport";
import { Request, Response, Router } from "express";
import BankInformationController from "../../../app/controllers/admin/v1/bank-information.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

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
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bankInformationController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bankInformationController.findOne(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bankInformationController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await bankInformationController.destroy(req, res)
    ),
  ]);

export default router;
