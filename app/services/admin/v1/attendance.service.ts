import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import { Prisma } from "@prisma/client";
import { CreateAttendanceInput, UpdateAttendanceInput } from "../../../schemas/admin/v1/attendance.schema";

class AttendanceService {
    async findAll(where?: Prisma.AttendanceWhereInput) {
        const attendances = await prisma.attendance.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true,
                        profile: {
                            select: {
                                profilePhoto: true
                            },
                        }
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        return attendances;
    }

    async findByPaginate(page: number, perPage: number, where?: Prisma.AttendanceWhereInput) {
        const attendances = await prisma.attendance.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        email: true,
                        profile: {
                            select: {
                                profilePhoto: true
                            },
                        }
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        const totalAttendance = await prisma.attendance.count({
            where,
        });

        return {
            data: attendances,
            meta: {
                totalCount: totalAttendance,
                totalPages: Math.ceil(totalAttendance / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalAttendance / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalAttendance / perPage),
            },
        };
    }

    async findOne(id: number) {
        const attendance = await prisma.attendance.findUnique({
            where: {
                id,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        code: true,
                        profile: {
                            select: {
                                profilePhoto: true
                            },
                        }
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        if (!attendance) {
            throw new NotFoundException("Attendance not found");
        }

        return attendance;
    }

    async create(createAttendanceInput: CreateAttendanceInput, userId: number) {
        const { memberId, date } = createAttendanceInput;

        const existingSameDateAttendanceMember = await prisma.attendance.findFirst({
            where: {
                memberId,
                date,
            },
        });

        if (existingSameDateAttendanceMember) {
            throw new NotFoundException("Attendance for the same member and date already exists");
        }

        const attendance = await prisma.attendance.create({
            data: {
                memberId,
                date,
                createdById: userId,
            },
        });

        return this.findOne(attendance.id);
    }

    async update(id: number, updateAttendanceInput: UpdateAttendanceInput, userId: number) {
        const { memberId, date } = updateAttendanceInput;

        // Check attendance exists
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                id,
            },
        });

        if (!existingAttendance) {
            throw new NotFoundException("Attendance not found");
        }

        await prisma.attendance.update({
            where: {
                id,
            },
            data: {
                memberId: memberId ?? existingAttendance.memberId,
                date: existingAttendance.date,
                updatedById: userId,
            },
        });

        return this.findOne(id);
    }

    async destroy(id: number) {
        const attendance = await this.findOne(id);

        await prisma.attendance.delete({
            where: { id },
        });

        return attendance;
    }
}

export default AttendanceService;
