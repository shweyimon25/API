import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import {
  memberSocialPostCommentCreateSchema,
  memberSocialPostCommentUpdateSchema,
} from "../../../schemas/member/v1/member-social-post-comment.schema";
import prisma from "../../../../prisma/client";
import { Member } from "@prisma/client";
import { formatDate } from "../../../helpers/helper";

class memberPostCommentController {
  async memberPostComments(req: Request, res: Response) {
    const filters = req.body.params.filters;

    const socialPostIdMatch = filters.match(
      /\('social_post_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );
    const shopPostIdMatch = filters.match(
      /\('shop_post_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );

    const socialPostId = socialPostIdMatch
      ? Number(socialPostIdMatch[1])
      : undefined;
    const shopPostId = shopPostIdMatch ? Number(shopPostIdMatch[1]) : undefined;
    const postId = socialPostId ?? shopPostId;

    const comments = await prisma.postComment.findMany({
      where: {
        postId: postId,
        parentId: null,
        ...(socialPostId ? { type: "social" } : { type: "shop" }),
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        post: true,
        parent: true,
        replies: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCommentReactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mentionMemberIds: number[] = [];

    for (const comment of comments) {
      const ids = (comment.mentionMemberIds as number[]) ?? [];
      mentionMemberIds.push(...ids);

      for (const reply of comment.replies) {
        const replyIds = (reply.mentionMemberIds as number[]) ?? [];
        mentionMemberIds.push(...replyIds);
      }
    }

    const uniqueMentionIds = [...new Set(mentionMemberIds)];

    const mentionMembers = uniqueMentionIds.length
      ? await prisma.member.findMany({
          where: {
            id: { in: uniqueMentionIds },
          },
          include: {
            profile: true,
          },
        })
      : [];

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count: comments.length,
          results: comments.map((comment) => {
            const commentMentionIds = (comment.mentionMemberIds as number[]) ?? [];

            return {
              id: comment.id,
              name: comment.comment,
              type: comment.type,
              is_react: false,
              react_count: 0,
              create_date: formatDate(comment.createdAt),
              mentioned_users: comment.mentionUsers ?? "",
              mentioned_members: commentMentionIds.map((memberId) => {
                const member = mentionMembers.find((m) => m.id === +memberId);
                return {
                  id: member?.id,
                  name: member?.name,
                  image_1920: member?.profile?.coverPhoto ?? "",
                };
              }),
              create_uid: {
                id: comment.member?.id,
                name: comment.member.name,
                image_1920: comment.member.profile?.coverPhoto ?? "",
              },
              partner_id: {
                name: comment.member.name,
                id: comment.member?.id,
                image_1920: comment.member.profile?.coverPhoto ?? "",
              },
              shop_post_id:
                comment.type === "shop"
                  ? {
                      id: comment.postId,
                      caption: comment.post.caption,
                    }
                  : {
                      id: null,
                      caption: null,
                    },
              social_post_id:
                comment.type === "shop"
                  ? {
                      id: null,
                      caption: null,
                    }
                  : {
                      id: comment.postId,
                      is_react: false,
                      caption: comment.post.caption,
                    },
              parent_command_id: {
                name: comment.parent?.comment ?? null,
                id: comment.parentId ?? null,
              },
              child_comment_count: comment.replies.length,
              child_comment_line: comment.replies.map((reply) => {
                const replyMentionIds = (reply.mentionMemberIds as number[]) ?? [];

                return {
                  id: reply.id,
                  name: reply.comment,
                  type: reply.type,
                  is_react: false,
                  react_count: reply.postCommentReactions?.length ?? 0,
                  create_date: formatDate(reply.createdAt),
                  mentioned_users: reply.mentionUsers ?? "",
                  mentioned_members: replyMentionIds.map((memberId) => {
                    const member = mentionMembers.find((m) => m.id === +memberId);
                    return {
                      id: member?.id,
                      name: member?.name,
                      image_1920: member?.profile?.coverPhoto ?? "",
                    };
                  }),
                  create_uid: {
                    id: reply.member?.id,
                    name: reply.member?.name,
                    image_1920: reply.member?.profile?.coverPhoto ?? "",
                  },
                  partner_id: {
                    id: reply.member?.id,
                    name: reply.member?.name,
                    image_1920: reply.member?.profile?.coverPhoto ?? "",
                  },
                  shop_post_id:
                    reply.type === "shop"
                      ? {
                          id: comment.postId,
                          caption: comment.post.caption,
                        }
                      : {
                          id: null,
                          caption: null,
                        },
                  social_post_id:
                    reply.type === "shop"
                      ? {
                          id: null,
                          caption: null,
                        }
                      : {
                          id: comment.postId,
                          caption: comment.post.caption,
                          is_react: false,
                        },
                };
              }),
            };
          }),
        },
      },
    });
  }

  async memberPostCommentCreate(req: Request, res: Response) {
    const { data, success, error } = await validater(
      memberSocialPostCommentCreateSchema,
      req.body.params,
    );

    if (!success) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: error[0].issue,
        },
      });
    }

    let existingSocialPost;
    if (data.social_post_id) {
      existingSocialPost = await prisma.post.findFirst({
        where: {
          id: +data.social_post_id,
          shopId: null,
        },
      });
    }

    let existingShopPost;
    if (data.shop_post_id) {
      existingShopPost = await prisma.post.findFirst({
        where: {
          id: +data.shop_post_id,
          shopId: {
            not: null,
          },
        },
      });
    }

    const targetPost = existingSocialPost || existingShopPost;

    if (!targetPost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Post not found",
        },
      });
    }

    const mentionMemberIds = (data.mention_member_ids ?? []).map(
      (id: number) => +id,
    );

    if (mentionMemberIds.length > 0) {
      const foundMembers = await prisma.member.findMany({
        where: {
          id: { in: mentionMemberIds },
        },
        select: { id: true },
      });

      const foundIds = foundMembers.map((member) => member.id);
      const missingIds = mentionMemberIds.filter(
        (id: number) => !foundIds.includes(id),
      );

      if (missingIds.length > 0) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: `Mentioned member(s) not found: ${missingIds.join(", ")}`,
          },
        });
      }
    }

    if (data.parent_command_id) {
      const existingParentComment = await prisma.postComment.findFirst({
        where: {
          id: +data.parent_command_id,
          postId: +targetPost.id,
        },
      });

      if (!existingParentComment) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Parent comment not found",
          },
        });
      }
    }

    const newComment = await prisma.postComment.create({
      data: {
        comment: data.name,
        postId: targetPost.id,
        type: existingShopPost ? "shop" : "social",
        memberId: +(req.user as Member).id,
        parentId: data.parent_command_id ? +data.parent_command_id : null,
        mentionMemberIds,
        mentionUsers: data.mentioned_users ?? "",
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        post: true,
        parent: true,
        replies: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCommentReactions: true,
          },
        },
      },
    });

    const mentionMembers = mentionMemberIds.length
      ? await prisma.member.findMany({
          where: {
            id: { in: mentionMemberIds },
          },
          include: {
            profile: true,
          },
        })
      : [];

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: newComment.id,
          name: newComment.comment,
          type: newComment.type,
          is_react: false,
          react_count: 0,
          create_date: formatDate(newComment.createdAt),
          mentioned_users: newComment.mentionUsers ?? "",
          mentioned_members: mentionMemberIds.map((memberId: number) => {
            const member = mentionMembers.find((m) => m.id === memberId);
            return {
              id: member?.id,
              name: member?.name,
              image_1920: member?.profile?.coverPhoto ?? "",
            };
          }),
          create_uid: {
            id: newComment.memberId,
            name: newComment.member.name,
            image_1920: newComment.member.profile?.coverPhoto ?? "",
          },
          partner_id: {
            name: newComment.member.name,
            id: newComment.memberId,
            image_1920: newComment.member.profile?.coverPhoto ?? "",
          },
          shop_post_id:
            newComment.type === "shop"
              ? {
                  id: newComment.postId,
                  caption: newComment.post.caption,
                }
              : {
                  id: null,
                  caption: null,
                },
          social_post_id:
            newComment.type === "shop"
              ? {
                  id: null,
                  caption: null,
                }
              : {
                  id: newComment.postId,
                  is_react: false,
                  caption: newComment.post.caption,
                },
          parent_command_id: {
            name: newComment.parent?.comment ?? null,
            id: newComment.parentId ?? null,
          },
          child_comment_count: newComment.replies.length,
          child_comment_line: newComment.replies.map((reply) => {
            const replyMentionIds = (reply.mentionMemberIds as number[]) ?? [];

            return {
              id: reply.id,
              name: reply.comment,
              type: reply.type,
              is_react: false,
              react_count: reply.postCommentReactions?.length ?? 0,
              create_date: formatDate(reply.createdAt),
              mentioned_members: replyMentionIds.map((memberId) => {
                const member = mentionMembers.find((m) => m.id === +memberId);
                return {
                  id: member?.id,
                  name: member?.name,
                  image_1920: member?.profile?.coverPhoto ?? "",
                };
              }),
              create_uid: {
                id: reply.member?.id,
                name: reply.member?.name,
                image_1920: reply.member?.profile?.coverPhoto ?? "",
              },
              partner_id: {
                id: reply.member?.id,
                name: reply.member?.name,
                image_1920: reply.member?.profile?.coverPhoto ?? "",
              },
              shop_post_id:
                reply.type === "shop"
                  ? {
                      id: newComment.postId,
                      caption: newComment.post.caption,
                    }
                  : {
                      id: null,
                      caption: null,
                    },
              social_post_id:
                reply.type === "shop"
                  ? {
                      id: null,
                      caption: null,
                    }
                  : {
                      id: newComment.postId,
                      caption: newComment.post.caption,
                      is_react: false,
                    },
            };
          }),
        },
      },
    });
  }

  async memberPostCommentUpdate(req: Request, res: Response) {
    const { data, success, error } = await validater(
      memberSocialPostCommentUpdateSchema,
      req.body.params,
    );

    if (!success) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: error[0].issue,
        },
      });
    }

    const existingComment = await prisma.postComment.findFirst({
      where: {
        id: +req.params.id,
      },
      include: {
        post: true,
        member: true,
        parent: true,
        replies: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCommentReactions: true,
          },
        },
        postCommentReactions: true,
      },
    });

    if (!existingComment) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Comment not found",
        },
      });
    }

    if (existingComment.memberId !== +(req.user as Member).id) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You can only update your own comments",
        },
      });
    }

    const mentionMemberIds =
      data.mention_member_ids !== undefined
        ? (data.mention_member_ids ?? []).map((id: number) => +id)
        : ((existingComment.mentionMemberIds as number[]) ?? []);

    if (data.mention_member_ids && data.mention_member_ids.length > 0) {
      const foundMembers = await prisma.member.findMany({
        where: {
          id: { in: mentionMemberIds },
        },
        select: { id: true },
      });

      const foundIds = foundMembers.map((member) => member.id);
      const missingIds = mentionMemberIds.filter(
        (id: number) => !foundIds.includes(id),
      );

      if (missingIds.length > 0) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: `Mentioned member(s) not found: ${missingIds.join(", ")}`,
          },
        });
      }
    }

    if (data.parent_command_id) {
      if (+data.parent_command_id === existingComment.id) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Comment cannot be its own parent",
          },
        });
      }

      const existingParentComment = await prisma.postComment.findFirst({
        where: {
          id: +data.parent_command_id,
          postId: existingComment.postId,
        },
      });

      if (!existingParentComment) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Parent comment not found",
          },
        });
      }
    }

    const updatedComment = await prisma.postComment.update({
      where: {
        id: existingComment.id,
      },
      data: {
        comment: data.name,
        ...(data.parent_command_id !== undefined && {
          parentId: data.parent_command_id ? +data.parent_command_id : null,
        }),
        ...(data.mention_member_ids !== undefined && {
          mentionMemberIds,
        }),
        ...(data.mentioned_users !== undefined && {
          mentionUsers: data.mentioned_users ?? "",
        }),
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        post: true,
        parent: true,
        replies: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCommentReactions: true,
          },
        },
        postCommentReactions: true,
      },
    });

    const mentionMembers = mentionMemberIds.length
      ? await prisma.member.findMany({
          where: {
            id: { in: mentionMemberIds },
          },
          include: {
            profile: true,
          },
        })
      : [];

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: updatedComment.id,
          name: updatedComment.comment,
          type: updatedComment.type,
          is_react: false,
          react_count: updatedComment.postCommentReactions?.length ?? 0,
          create_date: formatDate(updatedComment.createdAt),
          mentioned_users: updatedComment.mentionUsers ?? "",
          mentioned_members: mentionMemberIds.map((memberId: number) => {
            const member = mentionMembers.find((m) => m.id === memberId);
            return {
              id: member?.id,
              name: member?.name,
              image_1920: member?.profile?.coverPhoto ?? "",
            };
          }),
          create_uid: {
            id: updatedComment.member?.id,
            name: updatedComment.member.name,
            image_1920: updatedComment.member.profile?.coverPhoto ?? "",
          },
          partner_id: {
            name: updatedComment.member.name,
            id: updatedComment.memberId,
            image_1920: updatedComment.member.profile?.coverPhoto ?? "",
          },
          shop_post_id:
            updatedComment.type === "shop"
              ? {
                  id: updatedComment.postId,
                  caption: updatedComment.post.caption,
                }
              : {
                  id: null,
                  caption: null,
                },
          social_post_id:
            updatedComment.type === "shop"
              ? {
                  id: null,
                  caption: null,
                }
              : {
                  id: updatedComment.postId,
                  is_react: false,
                  caption: updatedComment.post.caption,
                },
          parent_command_id: {
            name: updatedComment.parent?.comment ?? null,
            id: updatedComment.parentId ?? null,
          },
          child_comment_count: updatedComment.replies.length,
          child_comment_line: updatedComment.replies.map((reply) => {
            const replyMentionIds = (reply.mentionMemberIds as number[]) ?? [];

            return {
              id: reply.id,
              name: reply.comment,
              type: reply.type,
              is_react: false,
              react_count: reply.postCommentReactions?.length ?? 0,
              create_date: formatDate(reply.createdAt),
              mentioned_users: reply.mentionUsers ?? "",
              mentioned_members: replyMentionIds.map((memberId) => {
                const member = mentionMembers.find((m) => m.id === +memberId);
                return {
                  id: member?.id,
                  name: member?.name,
                  image_1920: member?.profile?.coverPhoto ?? "",
                };
              }),
              create_uid: {
                id: reply.member?.id,
                name: reply.member?.name,
                image_1920: reply.member?.profile?.coverPhoto ?? "",
              },
              partner_id: {
                id: reply.member?.id,
                name: reply.member?.name,
                image_1920: reply.member?.profile?.coverPhoto ?? "",
              },
              shop_post_id:
                reply.type === "shop"
                  ? {
                      id: updatedComment.postId,
                      caption: updatedComment.post.caption,
                    }
                  : {
                      id: null,
                      caption: null,
                    },
              social_post_id:
                reply.type === "shop"
                  ? {
                      id: null,
                      caption: null,
                    }
                  : {
                      id: updatedComment.postId,
                      caption: updatedComment.post.caption,
                      is_react: false,
                    },
            };
          }),
        },
      },
    });
  }

  async memberPostCommentDelete(req: Request, res: Response) {
    const postComment = await prisma.postComment.findFirst({
      where: {
        id: +req.params.id,
        memberId: (req.user as Member).id,
      },
    });

    if (!postComment) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Comment not found.",
        },
      });
    }

    await prisma.postComment.delete({
      where: {
        id: +req.params.id,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Delete Successfully.",
      },
    });
  }
}

export default memberPostCommentController;
