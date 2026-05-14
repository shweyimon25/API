import passport from "passport";
import { Request, Response, Router } from "express";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import ReportCategoryController from "../../../app/controllers/member/v1/report-cateogory.controller";

const router = Router();
const reportCategoryController = new ReportCategoryController();

router
  .route("/")
  .get([
    
    passport.authenticate("jwt", { session: false }),
    asyncHandler(
        
      async (req: Request, res: Response) =>
        await reportCategoryController.findAll(req, res)
      
    ),
  ]);


router.route("/:id").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await reportCategoryController.findOne(req, res)
  ),
]);

export default router;
