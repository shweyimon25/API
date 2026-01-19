import { MemberRequestStatus, Prisma } from "@prisma/client";

interface MemberRequestScopeQuery {
    name?: string;
    code?: string;
    phone?: string;
    email?: string;
    memberTypeId?: string;
    memberPlanId?: string;
    status?: string;
}

export const memberRequestScope = (query: MemberRequestScopeQuery): Prisma.MemberRequestWhereInput => {
    const { name, code, phone, email, memberTypeId, memberPlanId, status } = query;

    const where: Prisma.MemberRequestWhereInput = {};

    if (name) {
        where.member = {
            name: {
                contains: name,
                mode: "insensitive"
            }
        }
    }

    if (code) {
        where.member = {
            code: {
                contains: code,
                mode: "insensitive"
            }
        }
    }

    if (phone) {
        where.member = {
            phone: {
                contains: phone,
                mode: "insensitive"
            }
        }
    }

    if (email) {
        where.member = {
            email: {
                contains: email,
                mode: "insensitive"
            }
        }
    }

    if (memberTypeId) {
        where.memberTypeId = +memberTypeId;
    }

    if (memberPlanId) {
        where.memberPlanId = +memberPlanId;
    }

    if (status) {
        where.status = status as MemberRequestStatus;
    }

    return where;
};