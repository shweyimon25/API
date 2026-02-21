import { Prisma, PaymentTypes, Status } from "@prisma/client";

interface MemberScopeQuery {
    memberName?: string;
    memberEmail?: string;
    memberCode?: string;
    date?: string;
}

export const attendanceScope = (query: MemberScopeQuery): Prisma.AttendanceWhereInput => {
    const { memberName, memberEmail, memberCode, date } = query;

    const where: Prisma.AttendanceWhereInput = {};

    if (memberName) {
        where.member = {
            name: {
                contains: memberName,
                mode: "insensitive",
            },
        };
    }

    if (memberEmail) {
        where.member = {
            email: {
                contains: memberEmail,
                mode: "insensitive",
            },
        }
    }

    if (memberCode) {
        where.member = {
            code: {
                contains: memberCode,
                mode: "insensitive",
            },
        }
    }

    if (date) {
        where.date = date
    }

    return where;
};
