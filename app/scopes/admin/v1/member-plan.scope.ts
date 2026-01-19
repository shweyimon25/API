import { Prisma, Status } from "@prisma/client";

interface MemberPlanScopeQuery {
    name?: string;
    memberTypeId?: string;
    minPrice?: string;
    maxPrice?: string;
    duration?: string;
    isVideoGroup?: "true" | "false";
    status?: string;
}

export const memberPlanScope = (query: MemberPlanScopeQuery): Prisma.MemberPlanWhereInput => {
    const { name, memberTypeId, minPrice, maxPrice, duration, isVideoGroup, status } = query;

    const where: Prisma.MemberPlanWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (memberTypeId) {
        where.memberTypeId = +memberTypeId;
    }

    if (minPrice) {
        where.price = {
            gte: +minPrice
        };
    }

    if (maxPrice) {
        where.price = {
            lte: +maxPrice
        };
    }

    if (duration) {
        where.duration = +duration;
    }

    if (isVideoGroup) {
        where.isVideoGroup = isVideoGroup === "false" ? false : true
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};

