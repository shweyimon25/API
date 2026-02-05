import prisma from "../../../../prisma/client";
import { ForbiddenException, NotFoundException } from "../../../helpers/exceptions";
import { CreatePostReactionInput } from "../../../schemas/member/v1/post-reaction.schema";
import { PrivencyType } from "@prisma/client";

const memberSelect = {
  id: true,
  name: true,
  email: true,
  code: true,
  profile: { select: { profilePhoto: true } },
};

class PostReactionService {
  async findAll(postId: string | number) {
    const reactions = await prisma.postReaction.findMany({
      where: { postId: +postId },
      include: { member: { select: memberSelect } },
      orderBy: { createdAt: "desc" },
    });
    return reactions;
  }

  async findOne(id: number) {
    const reaction = await prisma.postReaction.findUnique({
      where: { id },
      include: { member: { select: memberSelect } },
    });
    if (!reaction) {
      throw new NotFoundException("Post reaction not found");
    }
    return reaction;
  }

  async give(input: CreatePostReactionInput, memberId: number) {
    const { postId } = input;

    const post = await prisma.post.findFirst({ where: { id: postId, privencyType: PrivencyType.PUBLIC } });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const existing = await prisma.postReaction.findFirst({ where: { postId, memberId } });
    if (existing) {
      // Toggle: if exists, delete it (remove heart)
      await prisma.postReaction.delete({ where: { id: existing.id } });
      return null;
    }

    // Create reaction (add heart)
    const created = await prisma.postReaction.create({
      data: { postId, memberId },
      include: { member: { select: memberSelect } },
    });
    return created;
  }

  async destroy(id: number, memberId: number) {
    const existing = await prisma.postReaction.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Post reaction not found");
    }
    if (existing.memberId !== memberId) {
      throw new ForbiddenException("You can only delete your own reaction");
    }
    await prisma.postReaction.delete({ where: { id } });
  }
}

export default PostReactionService;
