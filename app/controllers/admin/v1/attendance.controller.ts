import { Request, Response } from "express";
import AttendanceService from "../../../services/admin/v1/attendance.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { createAttendanceSchema, updateAttendanceSchema } from "../../../schemas/admin/v1/attendance.schema";
import { AttendanceCollection } from "../../../resources/admin/v1/attendance/v1/attendance.collection";
import { AttendanceResource } from "../../../resources/admin/v1/attendance/v1/attendance.resource";
import { attendanceScope } from "../../../scopes/admin/v1/attendance.scope";

class AttendanceController {
    private attendanceService: AttendanceService;

    constructor() {
        this.attendanceService = new AttendanceService();
    }

    async findAll(req: Request, res: Response) {
        const { page, perPage } = req.query;

        const where = attendanceScope(req.query);

        if (page && perPage) {
            const attendances = await this.attendanceService.findByPaginate(+page, +perPage, where);
            return successResponse(
                res,
                "Attendance list successfully",
                AttendanceCollection.withPagination(attendances)
            );
        }

        const attendances = await this.attendanceService.findAll(where);
        return successResponse(
            res,
            "Attendance list successfully",
            AttendanceCollection.toCollection(attendances)
        );
    }

    async findOne(req: Request, res: Response) {
        const attendance = await this.attendanceService.findOne(+req.params.id);

        return successResponse(
            res,
            "Attendance details successfully",
            AttendanceResource.toResource(attendance)
        );
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createAttendanceSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to create attendance", error);
        }

        const userId = (req.user as any)?.id;
        const attendance = await this.attendanceService.create(data, userId);
        return successResponse(
            res,
            "Attendance created successfully",
            AttendanceResource.toResource(attendance)
        );
    }

    async update(req: Request, res: Response) {
        const { data, success, error } = await validater(updateAttendanceSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to update attendance", error);
        }

        const userId = (req.user as any)?.id;
        const attendance = await this.attendanceService.update(
            +req.params.id,
            data,
            userId
        );

        return successResponse(
            res,
            "Attendance updated successfully",
            AttendanceResource.toResource(attendance)
        );
    }

    async destroy(req: Request, res: Response) {
        await this.attendanceService.destroy(+req.params.id);
        return successResponse(res, "Attendance deleted successfully");
    }
}

export default AttendanceController;
