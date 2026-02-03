import { Prisma } from "@prisma/client";

export interface MemberShopScopeQuery {
    name?: string;
    shopLevelId?: string;
    fromDate?: string;
    toDate?: string;
}

export const memberShopScope = (query: MemberShopScopeQuery): Prisma.ShopWhereInput => {
    const { name, shopLevelId, fromDate, toDate } = query;

    const where: Prisma.ShopWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }
    if (shopLevelId) {
        where.shopLevelId = +shopLevelId;
    }
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) {
            where.createdAt.gte = new Date(fromDate);
        }
        if (toDate) {
            where.createdAt.lte = new Date(toDate);
        }
    }

    return where;
};
