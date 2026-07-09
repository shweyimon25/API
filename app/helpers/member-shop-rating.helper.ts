import { Prisma, Status } from "@prisma/client";

const ODOO_IMAGE_BASE =
  process.env.ODOO_IMAGE_BASE_URL ?? "http://localhost:8069";

type ShopRatingListRecord = {
  id: number;
  rate: number;
  review: string | null;
  createdAt: Date;
  member: {
    id: number;
    name: string;
    profile: { profilePhoto: string | null } | null;
  };
  shop: {
    id: number;
    name: string;
  };
};

function partnerImageUrl(partnerId: number, storedUrl?: string | null) {
  if (storedUrl) return storedUrl;
  return `${ODOO_IMAGE_BASE}/web/content/?model=res.partner&id=${partnerId}&field=image_1920`;
}

function parseOrder(order: unknown): Prisma.ShopRatingOrderByWithRelationInput {
  const orderStr = typeof order === "string" ? order.trim().toLowerCase() : "";
  if (orderStr === "create_date desc") {
    return { createdAt: "desc" };
  }
  if (orderStr === "create_date asc") {
    return { createdAt: "asc" };
  }
  return { createdAt: "desc" };
}

export function buildMemberShopRatingWhere(
  filters: unknown,
): Prisma.ShopRatingWhereInput {
  const where: Prisma.ShopRatingWhereInput = {
    shop: { status: Status.ACTIVE },
  };
  const filtersStr =
    typeof filters === "string" ? filters : JSON.stringify(filters ?? "[]");
  const tupleRe =
    /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;

  let match: RegExpExecArray | null;
  while ((match = tupleRe.exec(filtersStr)) !== null) {
    const field = match[1];
    const op = match[2];
    const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");
    if (!value) continue;

    if (field === "shop_id" && op === "=") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        where.shopId = parsed;
      }
      continue;
    }

    if (field === "partner_id" && op === "=") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        where.memberId = parsed;
      }
    }
  }

  return where;
}

export const memberShopRatingInclude = {
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
  shop: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ShopRatingInclude;

export function formatMemberShopRating(rating: ShopRatingListRecord) {
  return {
    id: rating.id,
    partner_id: {
      id: rating.member.id,
      image_1920: partnerImageUrl(
        rating.member.id,
        rating.member.profile?.profilePhoto,
      ),
      name: rating.member.name,
    },
    shop_id: {
      id: rating.shop.id,
      name: rating.shop.name,
    },
    count: rating.rate,
    shop_review: rating.review ?? "",
  };
}

export function parseMemberShopRatingOrder(order: unknown) {
  return parseOrder(order);
}
