import prisma from "../../../../prisma/client";
import { ForbiddenException, NotFoundException } from "../../../helpers/exceptions";

const memberSelect = {
  id: true,
  name: true,
  email: true,
  code: true,
  profile: { select: { profilePhoto: true } },
};

function getFriendMembers(memberId: number, rows: any[]) {
  const seen = new Set<number>();
  const friendMembers: any[] = [];
  for (const f of rows) {
    const otherId = f.memberId === memberId ? f.friendId : f.memberId;
    if (seen.has(otherId)) continue;
    seen.add(otherId);
    friendMembers.push(f.memberId === memberId ? f.friend : f.member);
  }
  return friendMembers;
}

class FriendService {
  async findAll(memberId: number) {
    const allRows = await prisma.friend.findMany({
      where: {
        OR: [{ memberId }, { friendId: memberId }],
      },
      include: {
        member: { select: memberSelect },
        friend: { select: memberSelect },
      },
      orderBy: { createdAt: "desc" },
    });
    return getFriendMembers(memberId, allRows);
  }

  async findOne(memberId: number, id: number) {
    const friendRecord = await prisma.friend.findFirst({
      where: {
        OR: [
          { memberId, friendId: id },
          { memberId: id, friendId: memberId },
        ],
      },
      include: {
        member: { select: memberSelect },
        friend: { select: memberSelect },
      },
    });

    if (!friendRecord) {
      throw new NotFoundException("Friend not found");
    }
    if (friendRecord.memberId !== memberId && friendRecord.friendId !== memberId) {
      throw new ForbiddenException("You can only view your own friends");
    }

    return friendRecord.memberId === memberId ? friendRecord.friend : friendRecord.member;
  }

  async findByPaginate(memberId: number, page: number, perPage: number) {
    const allRows = await prisma.friend.findMany({
      where: {
        OR: [{ memberId }, { friendId: memberId }],
      },
      include: {
        member: { select: memberSelect },
        friend: { select: memberSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    const friendMembers = getFriendMembers(memberId, allRows);
    const total = friendMembers.length;
    const start = (page - 1) * perPage;
    const paginated = friendMembers.slice(start, start + perPage);

    return {
      data: paginated,
      meta: {
        totalCount: total,
        totalPages: Math.ceil(total / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(total / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(total / perPage),
      },
    };
  }

  async remove(memberId: number, id: number) {
    const friendRecord = await prisma.friend.findFirst({
      where: {
        OR: [
          { memberId, friendId: id },
          { memberId: id, friendId: memberId },
        ],
      },
    });

    if (!friendRecord) {
      throw new NotFoundException("Friend not found or already removed");
    }
    if (friendRecord.memberId !== memberId && friendRecord.friendId !== memberId) {
      throw new ForbiddenException("You can only remove your own friends");
    }

    await prisma.$transaction([
      prisma.friend.deleteMany({
        where: {
          OR: [
            { memberId, friendId: id },
            { memberId: id, friendId: memberId },
          ],
        },
      }),
    ]);
  }
}

export default FriendService;
