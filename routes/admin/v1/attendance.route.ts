import passport from "passport";
import { Request, Response, Router } from "express";
import AttendanceController from "../../../app/controllers/admin/v1/attendance.controller";
import { asyncHandler } from "../../../app/middlewares/handlers/async.handler";
import { hasPermission } from "../../../app/middlewares/guards/permission.guard";

const router = Router();
const attendanceController = new AttendanceController();

router
    .route("/")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['attendance:list']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await attendanceController.findAll(req, res)
        ),
    ])
    .post([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['attendance:create']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await attendanceController.create(req, res)
        ),
    ]);

router
    .route("/:id")
    .get([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['attendance:read']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await attendanceController.findOne(req, res)
        ),
    ])
    .put([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['attendance:update']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await attendanceController.update(req, res)
        ),
    ])
    .delete([
        passport.authenticate("jwt", { session: false }),
        hasPermission(['attendance:delete']),
        asyncHandler(
            async (req: Request, res: Response) =>
                await attendanceController.destroy(req, res)
        ),
    ]);

export default router;

