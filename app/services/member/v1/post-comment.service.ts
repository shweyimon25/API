import prisma from "../../../../prisma/client";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../../helpers/exceptions";
import {
  CreatePostCommentInput,
  UpdatePostCommentInput,
} from "../../../schemas/member/v1/post-comment.schema";
import { PrivencyType } from "@prisma/client";

const memberSelect = {
  id: true,
  name: true,
  email: true,
  code: true,
  profile: { select: { profilePhoto: true } },
};

function mapComment(c: any): any {
  const member = c.member
    ? {
        id: c.member.id,
        name: c.member.name,
        email: c.member.email,
        code: c.member.code,
        profile: c.member.profile ?? null,
      }
    : null;

  const reactions = (c.postCommentReactions ?? []).map((r: any) => ({
    memberId: r.memberId,
    reaction: r.reaction,
  }));

  return {
    id: c.id,
    comment: c.comment,
    parentId: c.parentId,
    member,
    reactions,
    reactionsCount: reactions.length,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    replies: (c.replies ?? []).map(mapComment),
  };
}

class PostCommentService {
  async create(input: CreatePostCommentInput, memberId: number) {
    const { postId, comment, parentId } = input;

    const post = await prisma.post.findFirst({
      where: { id: postId, privencyType: PrivencyType.PUBLIC },
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (parentId != null) {
      const parent = await prisma.postComment.findFirst({
        where: { id: parentId, postId },
      });
      if (!parent) {
        throw new BadRequestException(
          "Parent comment not found or does not belong to this post"
        );
      }
    }

    const created = await prisma.postComment.create({
      data: {
        postId,
        memberId,
        comment,
        parentId: parentId ?? null,
      },
      include: {
        member: { select: memberSelect },
      },
    });

    const withReplies = await prisma.postComment.findUnique({
      where: { id: created.id },
      include: {
        member: { select: memberSelect },
        postCommentReactions: {
          select: {
            postCommentId: true,
            memberId: true,
            reaction: true,
          },
        },
        replies: {
          include: {
            member: { select: memberSelect },
            postCommentReactions: {
              select: {
                postCommentId: true,
                memberId: true,
                reaction: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return withReplies!;
  }

  async findOne(id: number) {
    const comment = await prisma.postComment.findUnique({
      where: { id },
      include: {
        member: { select: memberSelect },
        postCommentReactions: {
          select: {
            postCommentId: true,
            memberId: true,
            reaction: true,
          },
        },
        replies: {
          include: {
            member: { select: memberSelect },
            postCommentReactions: {
              select: {
                postCommentId: true,
                memberId: true,
                reaction: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException("Post comment not found");
    }

    return comment;
  }

  async listByPostId(postId: number) {
    const post = await prisma.post.findFirst({
      where: { id: postId, privencyType: PrivencyType.PUBLIC },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    const topLevel = await prisma.postComment.findMany({
      where: { postId, parentId: null },
      include: {
        member: { select: memberSelect },
        postCommentReactions: {
          select: {
            postCommentId: true,
            memberId: true,
            reaction: true,
          },
        },
        replies: {
          include: {
            member: { select: memberSelect },
            postCommentReactions: {
              select: {
                postCommentId: true,
                memberId: true,
                reaction: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return topLevel.map(mapComment);
  }

  async update(id: number, input: UpdatePostCommentInput, memberId: number) {
    const { comment } = input;
    const existing = await prisma.postComment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Post comment not found");
    }

    if (existing.memberId !== memberId) {
      throw new ForbiddenException("You can only update your own comments");
    }

    const updated = await prisma.postComment.update({
      where: { id },
      data: { comment },
      include: {
        member: { select: memberSelect },
        postCommentReactions: {
          select: {
            postCommentId: true,
            memberId: true,
            reaction: true,
          },
        },
        replies: {
          include: {
            member: { select: memberSelect },
            postCommentReactions: {
              select: {
                postCommentId: true,
                memberId: true,
                reaction: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    return updated;
  }

  async destroy(id: number, memberId: number) {
    const existing = await prisma.postComment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException("Post comment not found");
    }
    if (existing.memberId !== memberId) {
      throw new ForbiddenException("You can only delete your own comments");
    }
    await prisma.postComment.delete({
      where: { id },
    });
  }
}

export default PostCommentService;
