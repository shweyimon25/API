import { Prisma, Status } from "@prisma/client";
import { parseOdooFilter } from "./personal-workout.helper";

const ODOO_IMAGE_BASE =
  process.env.ODOO_IMAGE_BASE_URL ?? "http://localhost:8069";

type ShopListRecord = {
  id: number;
  name: string;
  logo: string | null;
  createdAt: Date;
  member: {
    id: number;
    name: string;
    profile: { profilePhoto: string | null } | null;
  } | null;
  shopLevel: {
    id: number;
    name: string;
    postLimit: number;
  } | null;
  shopRatings: { rate: number; memberId: number }[];
  _count: { posts: number };
};

function formatDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function partnerImageUrl(partnerId: number, storedUrl?: string | null) {
  if (storedUrl) return storedUrl;
  return `${ODOO_IMAGE_BASE}/web/image/?model=res.partner&id=${partnerId}&field=image_1920`;
}

function shopImageUrl(shopId: number, storedUrl?: string | null) {
  if (storedUrl) return storedUrl;
  return `${ODOO_IMAGE_BASE}/web/content/?model=member.shop&id=${shopId}&field=image`;
}

export function resolveMemberIdFromPartnerId(partnerId: number) {
  return partnerId - 1;
}

function parseOrder(order: unknown): Prisma.ShopOrderByWithRelationInput {
  const orderStr = typeof order === "string" ? order.trim().toLowerCase() : "";
  if (orderStr === "create_date desc") {
    return { createdAt: "desc" };
  }
  if (orderStr === "create_date asc") {
    return { createdAt: "asc" };
  }
  return { createdAt: "desc" };
}

export function buildMemberShopWhere(filters: unknown): Prisma.ShopWhereInput {
  const where: Prisma.ShopWhereInput = { status: Status.ACTIVE };

  const partnerId = parseOdooFilter(filters, "partner_id");
  if (partnerId) {
    const parsed = Number(partnerId);
    if (Number.isFinite(parsed)) {
      where.memberId = parsed - 1;
    }
  }

  const shopId = parseOdooFilter(filters, "id");
  if (shopId) {
    const parsed = Number(shopId);
    if (Number.isFinite(parsed)) {
      where.id = parsed;
    }
  }

  const name = parseOdooFilter(filters, "name", "ilike");
  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  return where;
}

export const memberShopInclude = {
  member: {
    select: {
      id: true,
      name: true,
      profile: {
        select: {
          profilePhoto: true,
        },
      },
    },
  },
  shopLevel: {
    select: {
      id: true,
      name: true,
      postLimit: true,
    },
  },
  shopRatings: {
    select: {
      rate: true,
      memberId: true,
    },
  },
  _count: {
    select: {
      posts: true,
    },
  },
} satisfies Prisma.ShopInclude;

export function formatMemberShop(
  shop: ShopListRecord,
  currentMemberId?: number
) {
  const totalPost = shop._count.posts;
  const postLimit = shop.shopLevel?.postLimit ?? 0;
  const remainingPost = Math.max(0, postLimit - totalPost);

  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const rating of shop.shopRatings) {
    if (rating.rate >= 1 && rating.rate <= 5) {
      starCounts[rating.rate as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }

  const totalRateUserCount = shop.shopRatings.length;
  const rateCount =
    totalRateUserCount > 0
      ? shop.shopRatings.reduce((sum, rating) => sum + rating.rate, 0) /
        totalRateUserCount
      : 0;

  const userRating = currentMemberId
    ? shop.shopRatings.find((rating) => rating.memberId === currentMemberId)
    : undefined;

  const partnerId = shop.member ? shop.member.id + 1 : null;

  return {
    id: shop.id,
    name: shop.name,
    partner_id: shop.member
      ? {
          image_1920: partnerImageUrl(
            partnerId!,
            shop.member.profile?.profilePhoto
          ),
          name: shop.member.name,
          id: partnerId,
        }
      : {
          image_1920: "",
          name: null,
          id: null,
        },
    member_type_level_id: shop.shopLevel
      ? {
          count: shop.shopLevel.postLimit,
          name: shop.shopLevel.name,
          id: shop.shopLevel.id,
        }
      : {
          count: 0,
          name: null,
          id: null,
        },
    create_date: formatDate(shop.createdAt),
    image: shopImageUrl(shop.id, shop.logo),
    total_post: totalPost,
    rate_count: rateCount,
    total_rate_user_count: totalRateUserCount,
    five_star: starCounts[5],
    four_star: starCounts[4],
    three_star: starCounts[3],
    two_star: starCounts[2],
    one_star: starCounts[1],
    remaining_post: remainingPost,
    is_rate: userRating ? true : null,
  };
}

export function parseMemberShopOrder(order: unknown) {
  return parseOrder(order);
}
