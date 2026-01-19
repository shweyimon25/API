import { Prisma, Status } from "@prisma/client";

interface BodyAttentionAreaScopeQuery {
    status?: string;
}

export const bodyAttentionAreaScope = (query: BodyAttentionAreaScopeQuery): Prisma.BodyAttentionAreaWhereInput => {
    const { status } = query;

    const where: Prisma.BodyAttentionAreaWhereInput = {};

    if (status) {
        where.status = status as Status;
    }

    return where;
};
