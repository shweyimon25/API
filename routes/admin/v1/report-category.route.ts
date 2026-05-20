import passport from "passport";
import { Request, Response, Router } from "express";
import ReportCategoryController from "../../../app/controllers/admin/v1/report-category.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const reportCategoryController = new ReportCategoryController();

router
  .route("/")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['reportCategory:list']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await reportCategoryController.findAll(req, res)
    ),
  ])
  .post([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['reportCategory:create']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await reportCategoryController.create(req, res)
    ),
  ]);

router.route("/common").get([
  passport.authenticate("jwt", { session: false }),
  asyncHandler(
    async (req: Request, res: Response) =>
      await reportCategoryController.findCommonAll(req, res)
  ),
]);

router
  .route("/:id")
  .get([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['reportCategory:read']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await reportCategoryController.findOne(req, res)
    ),
  ])
  .put([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['reportCategory:update']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await reportCategoryController.update(req, res)
    ),
  ])
  .delete([
    passport.authenticate("jwt", { session: false }),
    hasPermission(['reportCategory:delete']),
    asyncHandler(
      async (req: Request, res: Response) =>
        await reportCategoryController.destroy(req, res)
    ),
  ]);

export default router;

