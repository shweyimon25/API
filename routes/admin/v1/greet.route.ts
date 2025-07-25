import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";

const router = Router();

router.route("/")
  .get(asyncHandler(async (req: Request, res: Response) => {
    res.send("Hello World!");
  }));


export default router;
