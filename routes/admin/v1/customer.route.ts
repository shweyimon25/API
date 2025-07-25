import passport from "passport";
import { Request, Response, Router } from "express";
import CustomerController from "../../../app/controllers/admin/v1/customer.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();
const customerController = new CustomerController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await customerController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await customerController.create(req, res)
    ),
  ]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await customerController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
      async (req: Request, res: Response) =>
        await customerController.update(req, res)
    ),
  ]);

export default router;
