import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import {
  memberSocialPostCommentCreateSchema,
  memberSocialPostCommentUpdateSchema,
} from "../../../schemas/member/v1/member-social-post-comment.schema";
import prisma from "../../../../prisma/client";
import { Member, PostComment } from "@prisma/client";
import { formatDate } from "../../../helpers/helper";

class memberPostCommentController {
  async memberPostComments(req: Request, res: Response) {
    // Filter
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

    // Post Comment List
    const comments = await prisma.postComment.findMany({
      where: {
        postId: postId,
        parentId: null,
        ...(socialPostId ? { type: "post" } : { type: "shop" }),
      },
      include: {
        mentionsUsers: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
          },
        },
        member: {
          include: {
            profile: true,
          },
        },
        post: true,
        parent: true,
        replies: true,
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
              is_react: false,
              react_count: 0,
              create_date: formatDate(comment.createdAt),

              mentioned_users: comment.mentionsUsers?.map((mentionUser) => ({
                id: mentionUser.id,
                name: mentionUser.member?.name,
                image_1920: mentionUser.member?.profile?.coverPhoto ?? "",
              })),

              create_uid: {
                id: comment.memberId,
                name: comment.member.name,
                image_1920: comment.member.profile?.coverPhoto ?? "",
              },

              partner_id: {
                name: comment.member.name,
                id: comment.memberId,
                image_1920: comment.member.profile?.coverPhoto ?? "",
              },

              ...(comment.type === "shop"
                ? {
                    shop_post_id: {
                      id: comment.postId,
                      caption: comment.post.caption,
                    },
                  }
                : {
                    social_post_id: {
                      id: comment.postId,
                      is_react: false,
                      caption: comment.post.caption,
                    },
                  }),

              parent_command_id: {
                name: comment.parent?.comment ?? null,
                id: comment.parentId ?? null,
              },

              child_comment_count: comment.replies.length,

              child_comment_line: comment.replies.map((reply) => ({
                id: reply.id,
                name: reply.comment,
              })),
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

    // Check existing social post
    let existingSocialPost;
    if (data.social_post_id) {
      existingSocialPost = await prisma.post.findFirst({
        where: {
          id: +data.social_post_id,
          shopId: null,
        },
      });
    }

    // Check existing shop post
    let existingShopPost;
    if (data.social_post_id) {
      existingShopPost = await prisma.post.findFirst({
        where: {
          id: +data.social_post_id,
          shopId: {
            not: null,
          },
        },
      });
    }

    const targetPost = existingSocialPost || existingShopPost;

    // Guard: postId is required on PostComment, so bail if no valid post found
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

    // Check mentioned members exist
    if (data.mention_member_ids && data.mention_member_ids.length > 0) {
      const foundMembers = await prisma.member.findMany({
        where: {
          id: { in: data.mention_member_ids.map((id: number) => +id) },
        },
        select: { id: true },
      });

      const foundIds = foundMembers.map((m) => m.id);
      const missingIds = data.mention_member_ids.filter(
        (id: number) => !foundIds.includes(+id),
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

    // Check parent comment exists, if replying to one
    let existingParentComment;

    if (data.parent_command_id) {
      existingParentComment = await prisma.postComment.findFirst({
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

    // Create the comment
    const newComment = await prisma.postComment.create({
      data: {
        comment: data.name,
        postId: targetPost.id,
        type: existingShopPost ? "shop" : "post",
        memberId: +(req.user as Member).id,
        parentId: data.parent_command_id ? +data.parent_command_id : null,
        mentionsUsers: data.mention_member_ids
          ? {
              create: data.mention_member_ids.map((id: number) => ({
                memberId: +id,
              })),
            }
          : undefined,
      },
      include: {
        mentionsUsers: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
          },
        },
        member: {
          include: {
            profile: true,
          },
        },
        post: true,
        parent: true,
        replies: true,
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
          is_react: false,
          react_count: 0,
          create_date: formatDate(newComment.createdAt),

          mentioned_users: newComment.mentionsUsers?.map(
            (mentionUser: any) => ({
              id: mentionUser.id,
              name: mentionUser.member?.name,
              image_1920: mentionUser.member?.profile?.coverPhoto ?? "",
            }),
          ),

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

          ...(newComment.type === "shop"
            ? {
                shop_post_id: {
                  id: newComment.postId,
                  caption: newComment.post.caption,
                },
              }
            : {
                social_post_id: {
                  id: newComment.postId,
                  is_react: false,
                  caption: newComment.post.caption,
                },
              }),

          parent_command_id: {
            name: newComment.parent?.comment ?? null,
            id: newComment.parentId ?? null,
          },

          child_comment_count: newComment.replies.length,

          child_comment_line: newComment.replies.map((reply: PostComment) => ({
            id: reply.id,
            name: reply.comment,
          })),
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
        mentionsUsers: true,
        parent: true,
        replies: true,
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

    if (data.mention_member_ids && data.mention_member_ids.length > 0) {
      const foundMembers = await prisma.member.findMany({
        where: {
          id: { in: data.mention_member_ids.map((id: number) => +id) },
        },
        select: { id: true },
      });

      const foundIds = foundMembers.map((m) => m.id);
      const missingIds = data.mention_member_ids.filter(
        (id: number) => !foundIds.includes(+id),
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
          mentionsUsers: {
            deleteMany: {},
            create: data.mention_member_ids.map((id: number) => ({
              memberId: +id,
            })),
          },
        }),
      },
      include: {
        mentionsUsers: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
          },
        },
        member: {
          include: {
            profile: true,
          },
        },
        post: true,
        parent: true,
        replies: true,
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
          is_react: false,
          react_count: updatedComment.postCommentReactions?.length ?? 0,
          create_date: formatDate(updatedComment.createdAt),

          mentioned_users: updatedComment.mentionsUsers?.map(
            (mentionUser: any) => ({
              id: mentionUser.id,
              name: mentionUser.member?.name,
              image_1920: mentionUser.member?.profile?.coverPhoto ?? "",
            }),
          ),

          create_uid: {
            id: updatedComment.memberId,
            name: updatedComment.member.name,
            image_1920: updatedComment.member.profile?.coverPhoto ?? "",
          },

          partner_id: {
            name: updatedComment.member.name,
            id: updatedComment.memberId,
            image_1920: updatedComment.member.profile?.coverPhoto ?? "",
          },

          ...(updatedComment.type === "shop"
            ? {
                shop_post_id: {
                  id: updatedComment.postId,
                  caption: updatedComment.post.caption,
                },
              }
            : {
                social_post_id: {
                  id: updatedComment.postId,
                  is_react: false,
                  caption: updatedComment.post.caption,
                },
              }),

          parent_command_id: {
            name: updatedComment.parent?.comment ?? null,
            id: updatedComment.parentId ?? null,
          },

          child_comment_count: updatedComment.replies.length,

          child_comment_line: updatedComment.replies.map(
            (reply: PostComment) => ({
              id: reply.id,
              name: reply.comment,
            }),
          ),
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
