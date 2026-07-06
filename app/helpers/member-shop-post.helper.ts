import { Prisma, PrivencyType, Status } from "@prisma/client";
import { parseOdooFilter } from "./personal-workout.helper";
import prisma from "../../prisma/client";

const ODOO_IMAGE_BASE =
  process.env.ODOO_IMAGE_BASE_URL ?? "http://localhost:8069";

type ShopPostRecord = {
  id: number;
  content: unknown;
  privencyType: PrivencyType | null;
  media: unknown;
  viewCount: number;
  createdAt: Date;
  member: {
    id: number;
    name: string;
    profile: { profilePhoto: string | null } | null;
  } | null;
  postReactions: { id: number }[];
  _count: { postReactions: number; postComments: number };
};

function formatDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function partnerImageUrl(partnerId: number, storedUrl?: string | null) {
  if (storedUrl) return storedUrl;
  return `${ODOO_IMAGE_BASE}/web/content/?model=res.partner&id=${partnerId}&field=image_1920`;
}

function caption(content: unknown) {
  if (content == null || content === "") return null;
  if (typeof content === "string") return content;
  if (typeof content === "object" && content !== null && "caption" in content) {
    const c = (content as Record<string, unknown>).caption;
    return c != null ? String(c) : null;
  }
  return String(content);
}

function sharePostId(content: unknown) {
  if (typeof content !== "object" || content === null) return null;
  const raw = (content as Record<string, unknown>).share_post_id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function viewType(privencyType: string | null | undefined) {
  if (privencyType === "PRIVATE") return "only_me";
  if (privencyType === "FRIEND") return "friend";
  return "public";
}

function postPrice(content: unknown) {
  if (typeof content !== "object" || content === null) return 0.0;
  const price = Number((content as Record<string, unknown>).price);
  return Number.isFinite(price) ? price : 0.0;
}

function postCurrency(content: unknown) {
  if (typeof content !== "object" || content === null) return "ks";
  const currency = (content as Record<string, unknown>).currency;
  if (typeof currency === "string" && currency.trim()) {
    return currency.toLowerCase();
  }
  return "ks";
}

function shopMediaLine(media: unknown) {
  const items = Array.isArray(media) ? media : [];
  return items.map((item) => {
    if (item && typeof item === "object") {
      const m = item as Record<string, unknown>;
      return {
        image: (m.image as string) ?? null,
        video: (m.video as string) ?? null,
      };
    }

    const url = String(item);
    const isVideo = /\.(mp4|mov|webm|mkv)(\?|$)/i.test(url);
    return {
      image: isVideo ? null : url,
      video: isVideo ? url : null,
    };
  });
}

export function emptyShopSharePost() {
  return {
    view_type: null,
    comment_count: 0,
    react_count: 0,
    is_react: null,
    create_date: null,
    view_count: 0,
    id: null,
    caption: null,
    share_count: 0,
  };
}

function parseOrder(order: unknown): Prisma.PostOrderByWithRelationInput {
  const orderStr = typeof order === "string" ? order.trim().toLowerCase() : "";
  if (orderStr === "create_date asc") {
    return { createdAt: "asc" };
  }
  return { createdAt: "desc" };
}

export function buildMemberShopPostWhere(
  filters: unknown
): Prisma.PostWhereInput {
  const and: Prisma.PostWhereInput[] = [
    { shopId: { not: null } },
    { shop: { status: Status.ACTIVE } },
  ];

  const partnerId = parseOdooFilter(filters, "partner_id");
  if (partnerId) {
    const parsed = Number(partnerId);
    if (Number.isFinite(parsed)) {
      and.push({ shop: { memberId: parsed} });
    }
  }

  const shopId = parseOdooFilter(filters, "shop_id");
  if (shopId) {
    const parsed = Number(shopId);
    if (Number.isFinite(parsed)) {
      and.push({ shopId: parsed });
    }
  }

  const postId = parseOdooFilter(filters, "id");
  if (postId) {
    const parsed = Number(postId);
    if (Number.isFinite(parsed)) {
      and.push({ id: parsed });
    }
  }

  const name = parseOdooFilter(filters, "caption", "ilike");
  if (name) {
    and.push({
      OR: [
        { content: { string_contains: name } },
        { content: { path: ["caption"], string_contains: name } },
      ],
    });
  }

  return { AND: and };
}

export function memberShopPostInclude(memberId: number) {
  return {
    member: {
      select: {
        id: true,
        name: true,
        profile: { select: { profilePhoto: true } },
      },
    },
    postReactions: { where: { memberId }, select: { id: true } },
    _count: { select: { postReactions: true, postComments: true } },
  } satisfies Prisma.PostInclude;
}

function formatShopSharedPost(
  post: ShopPostRecord,
  shareCount = 0
) {
  return {
    view_type: viewType(post.privencyType),
    comment_count: post._count.postComments,
    react_count: post._count.postReactions,
    is_react: post.postReactions.length > 0 ? true : null,
    create_date: formatDate(post.createdAt),
    view_count: post.viewCount ?? 0,
    id: post.id,
    caption: caption(post.content),
    share_count: shareCount,
  };
}

export function formatMemberShopPost(
  post: ShopPostRecord,
  sharePost?: ReturnType<typeof formatShopSharedPost> | null,
  shareCount = 0
) {
  const partnerId = post.member ? post.member.id : null;

  return {
    id: post.id,
    caption: caption(post.content),
    partner_id: post.member
      ? {
          id: partnerId,
          image_1920: partnerImageUrl(
            partnerId!,
            post.member.profile?.profilePhoto
          ),
          name: post.member.name,
        }
      : {
          id: null,
          image_1920: "",
          name: null,
        },
    view_type: viewType(post.privencyType),
    create_date: formatDate(post.createdAt),
    media_line: shopMediaLine(post.media),
    view_count: post.viewCount ?? 0,
    react_count: post._count.postReactions,
    comment_count: post._count.postComments,
    share_count: shareCount,
    is_react: post.postReactions.length > 0 ? true : null,
    price: postPrice(post.content),
    currency: postCurrency(post.content),
    share_post_id: sharePost ?? emptyShopSharePost(),
  };
}

export async function formatMemberShopPostWithShare(
  post: ShopPostRecord,
  memberId: number
) {
  const sharedPostId = sharePostId(post.content);
  const [shareCount, sharedPost] = await Promise.all([
    prisma.post.count({
      where: { content: { path: ["share_post_id"], equals: post.id } },
    }),
    sharedPostId
      ? prisma.post.findFirst({
          where: { id: sharedPostId, shopId: { not: null } },
          include: memberShopPostInclude(memberId),
        })
      : Promise.resolve(null),
  ]);

  const sharePost = sharedPost
    ? formatShopSharedPost(sharedPost as ShopPostRecord)
    : null;

  return formatMemberShopPost(post, sharePost, shareCount);
}

export function parseMemberShopPostOrder(order: unknown) {
  return parseOrder(order);
}
