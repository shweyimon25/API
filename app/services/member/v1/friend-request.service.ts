import prisma from "../../../../prisma/client";
import { Prisma } from "@prisma/client";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../../helpers/exceptions";
import { CreateFriendRequestInput, UpdateFriendRequestInput } from "../../../schemas/member/v1/friend-request.schema";
import { FriendRequestStatus } from "@prisma/client";

const memberSelect = {
  id: true,
  name: true,
  email: true,
  code: true,
  profile: { select: { profilePhoto: true } },
};

class FriendRequestService {
  async create(input: CreateFriendRequestInput, senderId: number) {
    const { receiverId } = input;

    if (receiverId === senderId) {
      throw new BadRequestException("You cannot send a friend request to yourself");
    }

    const receiver = await prisma.member.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException("Receiver not found");
    }

    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
    });
    if (existingRequest) {
      if (existingRequest.status === FriendRequestStatus.PENDING) {
        throw new BadRequestException("Friend request already sent");
      }
      if (existingRequest.status === FriendRequestStatus.ACCEPTED) {
        throw new BadRequestException("You are already friends");
      }
      // DECLINED - allow sending again by creating new (we have unique on senderId, receiverId so we need to delete old or use different approach)
      // Prisma unique prevents duplicate - so we can't insert. So we update the existing DECLINED to PENDING.
      await prisma.friendRequest.update({
        where: { id: existingRequest.id },
        data: { status: FriendRequestStatus.PENDING },
      });
      return this.findOne(existingRequest.id, senderId);
    }

    const reverseRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId },
      },
    });
    if (reverseRequest?.status === FriendRequestStatus.PENDING) {
      throw new BadRequestException("This user has already sent you a friend request. Accept it instead.");
    }

    const existingFriend = await prisma.friend.findFirst({
      where: {
        OR: [
          { memberId: senderId, friendId: receiverId },
          { memberId: receiverId, friendId: senderId },
        ],
      },
    });
    if (existingFriend) {
      throw new BadRequestException("You are already friends");
    }

    const created = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        sender: { select: memberSelect },
        receiver: { select: memberSelect },
      },
    });
    return created;
  }

  async findOne(id: number, memberId: number) {
    const request = await prisma.friendRequest.findUnique({
      where: { id },
      include: {
        sender: { select: memberSelect },
        receiver: { select: memberSelect },
      },
    });
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }
    if (request.senderId !== memberId && request.receiverId !== memberId) {
      throw new ForbiddenException("You can only view your own friend requests");
    }
    return request;
  }

  async findAll(memberId: number, type: "sent" | "received") {
    const where: Prisma.FriendRequestWhereInput =
      type === "sent"
        ? { senderId: memberId }
        : { receiverId: memberId };

    const requests = await prisma.friendRequest.findMany({
      where,
      include: {
        sender: { select: memberSelect },
        receiver: { select: memberSelect },
      },
      orderBy: { createdAt: "desc" },
    });
    return requests;
  }

  async findByPaginate(
    memberId: number,
    type: "sent" | "received",
    page: number,
    perPage: number
  ) {
    const where: Prisma.FriendRequestWhereInput =
      type === "sent"
        ? { senderId: memberId }
        : { receiverId: memberId };

    const [requests, total] = await Promise.all([
      prisma.friendRequest.findMany({
        where,
        include: {
          sender: { select: memberSelect },
          receiver: { select: memberSelect },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.friendRequest.count({ where }),
    ]);

    return {
      data: requests,
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

  async accept(id: number, memberId: number) {
    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }
    if (request.receiverId !== memberId) {
      throw new ForbiddenException("Only the receiver can accept the request");
    }
    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException("Request is no longer pending");
    }

    await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id },
        data: { status: FriendRequestStatus.ACCEPTED },
      }),
      prisma.friend.create({
        data: {
          memberId: request.senderId,
          friendId: request.receiverId,
        },
      }),
      prisma.friend.create({
        data: {
          memberId: request.receiverId,
          friendId: request.senderId,
        },
      }),
    ]);

    return this.findOne(id, memberId);
  }

  async update(id: number, input: UpdateFriendRequestInput, memberId: number) {
    const { status } = input;
    if (status === FriendRequestStatus.ACCEPTED) {
      return this.accept(id, memberId);
    }
    if (status === FriendRequestStatus.DECLINED) {
      return this.decline(id, memberId);
    }
    throw new BadRequestException("Invalid status");
  }

  async decline(id: number, memberId: number) {
    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }
    if (request.receiverId !== memberId) {
      throw new ForbiddenException("Only the receiver can decline the request");
    }
    if (request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException("Request is no longer pending");
    }

    const updated = await prisma.friendRequest.update({
      where: { id },
      data: { status: FriendRequestStatus.DECLINED },
      include: {
        sender: { select: memberSelect },
        receiver: { select: memberSelect },
      },
    });
    return updated;
  }

  async destroy(id: number, memberId: number) {
    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }
    if (request.senderId !== memberId && request.receiverId !== memberId) {
      throw new ForbiddenException("You can only cancel or remove your own friend requests");
    }
    if (request.senderId === memberId && request.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException("You can only cancel a pending request");
    }

    await prisma.friendRequest.delete({
      where: { id },
    });
  }
}

export default FriendRequestService;
