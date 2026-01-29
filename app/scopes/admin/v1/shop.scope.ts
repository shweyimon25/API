import { Prisma, Status } from "@prisma/client";

export interface ShopScopeQuery {
    name?: string;
    shopLevelId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}

export const shopScope = (query: ShopScopeQuery): Prisma.ShopWhereInput => {
    const { name, shopLevelId, status, fromDate, toDate } = query;

    const where: Prisma.ShopWhereInput = {};

    if (name) {
        where.name = { contains: name, mode: "insensitive" };
    }
    if (shopLevelId) {
        where.shopLevelId = +shopLevelId;
    }
    if (status) {
        where.status = status as Status;
    }
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
    }

    return where;
};
