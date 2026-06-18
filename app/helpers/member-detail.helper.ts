import prisma from "../../prisma/client";

const ODOO_IMAGE_BASE =
  process.env.ODOO_IMAGE_BASE_URL ?? "http://localhost:8069";

export type MemberDetailRecord = {
  id: number;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  clientType: string;
  memberType: { name: string } | null;
  profile: {
    profilePhoto: string | null;
    coverPhoto: string | null;
    bio: string | null;
    address: string | null;
    gender: string | null;
    age: number | null;
  } | null;
  shop: {
    id: number;
    shopLevel: {
      id: number;
      name: string;
      price: number;
      duration: number;
    } | null;
  } | null;
  bodyMeasurement: {
    heightFeet: string | null;
    heightInches: string | null;
    weight: string | null;
    neck: string | null;
    calf: string | null;
    waist: string | null;
    chest: string | null;
    hip: string | null;
    shoulders: string | null;
    arms: string | null;
    thigh: string | null;
    wrist: string | null;
  } | null;
  memberRequests: {
    id: number;
    approvedAt: Date | null;
    memberPlan: {
      id: number;
      name: string;
      price: number;
      duration: number;
      isVideoGroup: boolean;
      expiredAt: string | null;
    } | null;
  }[];
  shopUpgradeRequests: {
    id: number;
    approvedAt: Date | null;
    shopLevel: { name: string };
  }[];
  proficientLevel: { name: string } | null;
  bodyGoal: { name: string } | null;
};

export const memberDetailInclude = {
  profile: true,
  shop: { include: { shopLevel: true } },
  bodyMeasurement: true,
  memberType: true,
  memberRequests: {
    where: { status: "APPROVED" as const },
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: { memberPlan: true },
  },
  shopUpgradeRequests: {
    where: { status: "APPROVED" as const },
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: { shopLevel: true },
  },
  proficientLevel: true,
  bodyGoal: true,
};

function num(value: string | number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function lower(value: string | null | undefined) {
  return value ? value.toLowerCase() : null;
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${p(value.getMonth() + 1)}-${p(value.getDate())} ${p(value.getHours())}:${p(value.getMinutes())}:${p(value.getSeconds())}`;
}

function planDataType(memberTypeName: string | null | undefined) {
  if (!memberTypeName) return null;
  const name = memberTypeName.toLowerCase();
  if (name.includes("trainer")) return "trainer";
  if (name.includes("shop")) return "shop";
  return "member";
}

function resolveDuration(
  rawDuration: number,
  planDurations: { value: number }[]
) {
  if (planDurations.some((duration) => duration.value === rawDuration)) {
    return rawDuration;
  }
  if (rawDuration >= 30 && rawDuration % 30 === 0) {
    return rawDuration / 30;
  }
  return rawDuration || null;
}

function memberImageUrl(
  memberId: number,
  field: "image_1920" | "cover_photo",
  storedUrl?: string | null
) {
  if (storedUrl) return storedUrl;
  // return `${ODOO_IMAGE_BASE}/web/image/?model=res.users&id=${memberId}&field=${field}`;
  return '';
}

function formatShopPlanMemberType(name: string) {
  if (name.toLowerCase() === "free") return "Free Shop Plan";
  return name;
}

function emptyRequestId() {
  return {
    id: null,
    name: null,
    expired_date: null,
    confirm_date: null,
  };
}

function emptyMemberPlanId() {
  return {
    id: null,
    res_video_group: null,
    data_type: null,
    member_type: null,
    duration: null,
    price: 0.0,
  };
}

function emptyShopRequestId() {
  return {
    id: null,
    name: null,
    confirm_date: null,
  };
}

export function resolveFriendMeta(
  currentMemberId: number,
  memberId: number,
  isFriend: boolean,
  pendingFriendRequest: {
    id: number;
    senderId: number;
  } | null
) {
  let friendStatus = "none";
  if (currentMemberId === memberId) {
    friendStatus = "you";
  } else if (isFriend) {
    friendStatus = "friend";
  }

  let friendReqStatus: string | null = null;
  let friendRequestId: number | null = null;
  if (pendingFriendRequest) {
    friendRequestId = pendingFriendRequest.id;
    friendReqStatus =
      pendingFriendRequest.senderId === currentMemberId ? "sent" : "received";
  }

  return { friendStatus, friendReqStatus, friendRequestId };
}

export function buildMemberDetailData(
  member: MemberDetailRecord,
  counts: {
    totalShopPost: number;
    totalSocialPost: number;
    totalFriend: number;
    friendRequestNotiCount: number;
    socialUnreadNotiCount: number;
  },
  friendMeta: {
    friendStatus: string;
    friendReqStatus: string | null;
    friendRequestId: number | null;
  },
  defaultShopLevel: {
    id: number;
    name: string;
    price: number;
    duration: number;
  } | null,
  planDurations: { value: number }[]
) {
  const latestMemberRequest = member.memberRequests[0];
  const memberPlan = latestMemberRequest?.memberPlan;
  const latestShopRequest = member.shopUpgradeRequests[0];
  const shopLevel = member.shop?.shopLevel ?? defaultShopLevel;

  return {
    id: member.id,
    client_code: member.code,
    im_status: "offline",
    name: member.name,
    image_1920: memberImageUrl(
      member.id,
      "image_1920",
      ""
    ),
    cover_photo: memberImageUrl(
      member.id,
      "cover_photo",
      member.profile?.coverPhoto
    ),
    bio: member.profile?.bio ?? null,
    total_shop_post: counts.totalShopPost,
    total_social_post: counts.totalSocialPost,
    total_friend: counts.totalFriend,
    friend_status: friendMeta.friendStatus,
    friend_req_status: friendMeta.friendReqStatus,
    friend_request_id: friendMeta.friendRequestId,
    is_follow: null,
    follower_count: 0,
    following_count: 0,
    follower_id: null,
    login: member.email ?? member.phone ?? null,
    partner_id: member.id + 1,
    company_id: 1,
    phone: member.phone,
    address: member.profile?.address ?? null,
    gender: lower(member.profile?.gender ?? null),
    dob: null,
    age: member.profile?.age ?? 0,
    height_ft: num(member.bodyMeasurement?.heightFeet),
    height_in: num(member.bodyMeasurement?.heightInches),
    weight: num(member.bodyMeasurement?.weight),
    neck: num(member.bodyMeasurement?.neck),
    calf: num(member.bodyMeasurement?.calf),
    wrist: num(member.bodyMeasurement?.wrist),
    waist: num(member.bodyMeasurement?.waist),
    chest: num(member.bodyMeasurement?.chest),
    hip: num(member.bodyMeasurement?.hip),
    shoulders: num(member.bodyMeasurement?.shoulders),
    arms: num(member.bodyMeasurement?.arms),
    thigh: num(member.bodyMeasurement?.thigh),
    client_type: member.clientType,
    request_id: latestMemberRequest
      ? {
          id: latestMemberRequest.id,
          name: memberPlan?.name ?? null,
          expired_date: memberPlan?.expiredAt ?? null,
          confirm_date: formatDateTime(latestMemberRequest.approvedAt),
        }
      : emptyRequestId(),
    member_plan_id: memberPlan
      ? {
          id: memberPlan.id,
          res_video_group: memberPlan.isVideoGroup,
          data_type: planDataType(member.memberType?.name),
          member_type: memberPlan.name,
          duration: memberPlan.duration,
          price: Number(memberPlan.price),
        }
      : emptyMemberPlanId(),
    shop_request_id: latestShopRequest
      ? {
          id: latestShopRequest.id,
          name: latestShopRequest.shopLevel.name,
          confirm_date: formatDateTime(latestShopRequest.approvedAt),
        }
      : emptyShopRequestId(),
    shop_plan_id: shopLevel
      ? {
          id: shopLevel.id,
          data_type: "shop",
          member_type: formatShopPlanMemberType(shopLevel.name),
          duration: resolveDuration(shopLevel.duration, planDurations),
          price: Number(shopLevel.price),
        }
      : {
          id: null,
          data_type: "shop",
          member_type: null,
          duration: null,
          price: 0.0,
        },
    proficient_level: lower(member.proficientLevel?.name ?? null),
    main_goal_body_type: lower(member.bodyGoal?.name ?? null),
    total_trainer_unread_count: 0,
    total_unread_count: 0,
    need_info:
      !member.profile?.gender ||
      !member.profile?.age ||
      !member.bodyMeasurement,
    social_unread_noti_count: counts.socialUnreadNotiCount,
    friend_request_noti_count: counts.friendRequestNotiCount,
  };
}

export async function fetchMemberFriendMeta(
  currentMemberId: number,
  memberId: number
) {
  if (currentMemberId === memberId) {
    return resolveFriendMeta(currentMemberId, memberId, true, null);
  }

  const [isFriend, pendingFriendRequest] = await Promise.all([
    prisma.friend.findFirst({
      where: {
        OR: [
          { memberId: currentMemberId, friendId: memberId },
          { memberId, friendId: currentMemberId },
        ],
      },
    }),
    prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentMemberId, receiverId: memberId },
          { senderId: memberId, receiverId: currentMemberId },
        ],
        status: "PENDING",
      },
    }),
  ]);

  return resolveFriendMeta(
    currentMemberId,
    memberId,
    !!isFriend,
    pendingFriendRequest
  );
}

export async function fetchMemberCounts(
  memberId: number,
  shopId: number | null
) {
  const [totalShopPost, totalSocialPost, totalFriend, friendRequestNotiCount] =
    await Promise.all([
      shopId
        ? prisma.post.count({ where: { shopId } })
        : Promise.resolve(0),
      prisma.post.count({
        where: { memberId, shopId: null },
      }),
      prisma.friend.count({
        where: {
          OR: [{ memberId }, { friendId: memberId }],
        },
      }),
      prisma.friendRequest.count({
        where: { receiverId: memberId, status: "PENDING" },
      }),
    ]);

  return {
    totalShopPost,
    totalSocialPost,
    totalFriend,
    friendRequestNotiCount,
    socialUnreadNotiCount: 0,
  };
}

export async function fetchDefaultShopLevelAndDurations() {
  const [defaultShopLevel, planDurations] = await Promise.all([
    prisma.shopLevel.findFirst({
      where: { name: { equals: "Free", mode: "insensitive" } },
    }),
    prisma.planDuration.findMany(),
  ]);

  return { defaultShopLevel, planDurations };
}

export async function fetchMemberDetailData(
  memberId: number,
  currentMemberId: number
) {
  const member = await prisma.member.findFirst({
    where: { id: memberId },
    include: memberDetailInclude,
  });

  if (!member) return null;

  const [{ defaultShopLevel, planDurations }, counts, friendMeta] =
    await Promise.all([
      fetchDefaultShopLevelAndDurations(),
      fetchMemberCounts(memberId, member.shop?.id ?? null),
      fetchMemberFriendMeta(currentMemberId, memberId),
    ]);

  return buildMemberDetailData(
    member as MemberDetailRecord,
    counts,
    friendMeta,
    defaultShopLevel,
    planDurations
  );
}
