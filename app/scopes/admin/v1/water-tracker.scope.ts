import { Prisma } from "@prisma/client";

interface WaterTrackerScopeQuery {
    memberId?: string;
    date?: string;
}

export const waterTrackerScope = (query: WaterTrackerScopeQuery): Prisma.WaterTrackerWhereInput => {
    const { memberId, date } = query;

    const where: Prisma.WaterTrackerWhereInput = {};

    if (memberId) {
        where.memberId = +memberId;
    }

    if (date) {
        where.date = date;
    }

    return where;
};
