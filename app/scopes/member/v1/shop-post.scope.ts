import { Prisma } from "@prisma/client";

export interface MemberShopPostScopeQuery {
  caption?: string;
  shopId?: string;
  fromDate?: string;
  toDate?: string;
}

export const memberShopPostScope = (
  query: MemberShopPostScopeQuery,
): Prisma.PostWhereInput => {
  const { caption, shopId, fromDate, toDate } = query;

  const where: Prisma.PostWhereInput = {};

  if (caption) {
    where.caption = {
      equals: JSON.stringify(caption),
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
