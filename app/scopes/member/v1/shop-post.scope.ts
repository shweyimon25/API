import { Prisma } from "@prisma/client";

/** Member shop-post scope: no status filter – member API only returns posts from ACTIVE shops */
export interface MemberShopPostScopeQuery {
    caption?: string;
    shopId?: string;
    fromDate?: string;
    toDate?: string;
}

export const memberShopPostScope = (query: MemberShopPostScopeQuery): Prisma.ShopPostWhereInput => {
    const { caption, shopId, fromDate, toDate } = query;

    const where: Prisma.ShopPostWhereInput = {};

    if (caption) {
        where.caption = {
            contains: caption,
            mode: "insensitive",
        };
    }
    if (shopId) {
        where.shopId = +shopId;
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
