import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { ForbiddenException, NotFoundException } from "../../../helpers/exceptions";

const memberProfileSelect = {
  id: true,
  profilePhoto: true,
  coverPhoto: true,
  bio: true,
  gender: true,
  age: true,
}

const memberSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  code: true,
  memberType: true,
  profile: {
    select: memberProfileSelect
  }
};

class FriendService {
  async findAll(memberId: number, where: Prisma.FriendWhereInput) {
    const friends = await prisma.friend.findMany({
      where: {
        OR: [{ memberId }, { friendId: memberId }],
        ...where
      },
      include: {
        member: { select: memberSelect },
        friend: { select: memberSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    // To avoid duplicate friends when both sides have added each other
    const uniqueFriends = new Map<number, any>();

    for (const row of friends) {
      const friend =
        row.memberId === memberId ? row.friend : row.member;

      if (!uniqueFriends.has(friend.id)) {
        uniqueFriends.set(friend.id, {
          ...friend,
          friendsSince: row.createdAt,
        });
      }
    }

    return Array.from(uniqueFriends.values());
  }

  async findByPaginate(memberId: number, page: number, perPage: number, where: Prisma.FriendWhereInput) {
    const friends = await prisma.friend.findMany({
      where: {
        OR: [{ memberId }, { friendId: memberId }],
        ...where
      },
      include: {
        member: { select: memberSelect },
        friend: { select: memberSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalFriends = await prisma.friend.count({
      where: {
        OR: [{ memberId }, { friendId: memberId }],
      },
    });

    // To avoid duplicate friends when both sides have added each other
    const uniqueFriends = new Map<number, any>();

    for (const row of friends) {
      const friend =
        row.memberId === memberId ? row.friend : row.member;

      if (!uniqueFriends.has(friend.id)) {
        uniqueFriends.set(friend.id, {
          ...friend,
          friendsSince: row.createdAt,
        });
      }
    }

    return {
      data: Array.from(uniqueFriends.values()),
      meta: {
        totalCount: totalFriends,
        totalPages: Math.ceil(totalFriends / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalFriends / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalFriends / perPage),
      },
    };
  }

  async findOne(memberId: number, id: number) {
    const friend = await prisma.friend.findFirst({
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

    if (!friend) {
      throw new NotFoundException("Friend not found");
    }

    if (friend.memberId !== memberId && friend.friendId !== memberId) {
      throw new ForbiddenException("You can only view your own friends");
    }

    return friend.memberId === memberId ? friend.friend : friend.member;
  }


  async destroy(memberId: number, id: number) {
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

      prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: memberId, receiverId: id },
            { senderId: id, receiverId: memberId },
          ],
        },
      }),
    ]);
  }
}

export default FriendService;
