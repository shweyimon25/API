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
    const currentMemberId = (req.user as Member).id;

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
        post: {
          include: {
            postReactions: true,
          },
        },
        parent: true,
        postCommentReactions: true,
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

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count: comments.length,
          results: comments.map((comment) => {
            return {
              id: comment.id,
              name: comment.comment,
              type: comment.type,
              react_count: comment.postCommentReactions.length,
              is_react: comment.post.postReactions.some(
                (reaction) => reaction.memberId === currentMemberId,
              ),
              create_date: formatDate(comment.createdAt),
              mentioned_users: comment.mentionUsers ?? "",
              mention_ids: comment.mentionIds ?? [],
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
                    caption: comment.post.caption ?? "",
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
                    caption: comment.post.caption ?? "",
                    is_react: comment.post.postReactions.some(
                      (reaction) => reaction.memberId === currentMemberId,
                    ),
                  },
              parent_command_id: {
                name: comment.parent?.comment ?? null,
                id: comment.parentId ?? null,
              },
              child_comment_count: comment.replies.length,
              child_comment_line: comment.replies.map((reply) => {
                const replyIsReact = reply.postCommentReactions.some(
                  (reaction) => reaction.memberId === currentMemberId,
                );

                return {
                  id: reply.id,
                  name: reply.comment,
                  type: reply.type,
                  react_count: reply.postCommentReactions.length,
                  is_react: reply.postCommentReactions.some(
                    (reaction) => reaction.memberId === currentMemberId,
                  ),
                  create_date: formatDate(reply.createdAt),
                  mentioned_users: reply.mentionUsers ?? "",
                  mention_ids: reply.mentionIds ?? [],
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
                        caption: comment.post.caption ?? "",
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
                        caption: comment.post.caption ?? "",
                        is_react: comment.post.postReactions.some(
                          (reaction) =>
                            reaction.memberId === currentMemberId,
                        ),
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

    const currentMemberId = (req.user as Member).id;

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
        memberId: currentMemberId,
        parentId: data.parent_command_id ? +data.parent_command_id : null,
        mentionUsers: data.mentioned_users ?? "",
        mentionIds: data.mention_ids ?? [],
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        post: {
          include: {
            postReactions: true,
          },
        },
        parent: true,
        postCommentReactions: true,
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

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: newComment.id,
          name: newComment.comment,
          type: newComment.type,
          react_count: newComment.postCommentReactions.length,
          is_react: newComment.post.postReactions.some(
            (reaction) => reaction.memberId === currentMemberId,
          ),
          create_date: formatDate(newComment.createdAt),
          mentioned_users: newComment.mentionUsers ?? "",
          mention_ids: newComment.mentionIds ?? [],
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
                caption: newComment.post.caption ?? "",
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
                caption: newComment.post.caption ?? "",
                is_react: newComment.post.postReactions.some(
                  (reaction) => reaction.memberId === currentMemberId,
                ),
              },
          parent_command_id: {
            name: newComment.parent?.comment ?? null,
            id: newComment.parentId ?? null,
          },
          child_comment_count: newComment.replies.length,
          child_comment_line: newComment.replies.map((reply) => {
            const replyIsReact = reply.postCommentReactions.some(
              (reaction) => reaction.memberId === currentMemberId,
            );

            return {
              id: reply.id,
              name: reply.comment,
              type: reply.type,
              react_count: reply.postCommentReactions.length,
              is_react: replyIsReact,
              create_date: formatDate(reply.createdAt),
              mentioned_users: reply.mentionUsers ?? "",
              mention_ids: reply.mentionIds ?? [],
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
                    caption: newComment.post.caption ?? "",
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
                    caption: newComment.post.caption ?? "",
                    is_react: newComment.post.postReactions.some(
                      (reaction) => reaction.memberId === currentMemberId,
                    ),
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

    const currentMemberId = (req.user as Member).id;

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

    if (existingComment.memberId !== currentMemberId) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You can only update your own comments",
        },
      });
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
        ...(data.mention_ids !== undefined && {
          mentionIds: data.mention_ids ?? [],
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
        post: {
          include: {
            postReactions: true,
          },
        },
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

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: updatedComment.id,
          name: updatedComment.comment,
          type: updatedComment.type,
          react_count: updatedComment.postCommentReactions.length,
          is_react: updatedComment.post.postReactions.some(
            (reaction) => reaction.memberId === currentMemberId,
          ),
          create_date: formatDate(updatedComment.createdAt),
          mentioned_users: updatedComment.mentionUsers ?? "",
          mention_ids: updatedComment.mentionIds ?? [],
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
                caption: updatedComment.post.caption ?? "",
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
                caption: updatedComment.post.caption ?? "",
                is_react: updatedComment.post.postReactions.some(
                  (reaction) => reaction.memberId === currentMemberId,
                ),
              },
          parent_command_id: {
            name: updatedComment.parent?.comment ?? null,
            id: updatedComment.parentId ?? null,
          },
          child_comment_count: updatedComment.replies.length,
          child_comment_line: updatedComment.replies.map((reply) => {
            return {
              id: reply.id,
              name: reply.comment,
              type: reply.type,
              react_count: reply.postCommentReactions.length,
              is_react: reply.postCommentReactions.some(
                (reaction) => reaction.memberId === currentMemberId,
              ),
              create_date: formatDate(reply.createdAt),
              mentioned_users: reply.mentionUsers ?? "",
              mention_ids: reply.mentionIds ?? [],
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
                    caption: updatedComment.post.caption ?? "",
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
                    caption: updatedComment.post.caption ?? "",
                    is_react: updatedComment.post.postReactions.some(
                      (reaction) => reaction.memberId === currentMemberId,
                    ),
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
