import { Request, Response } from "express";
import { validater } from "../../../helpers/validator";
import { checkMemberSocialPostReactSchema } from "../../../schemas/member/v1/member-social-post-react.schema";
import prisma from "../../../../prisma/client";
import { Member } from "@prisma/client";

class MemberSocialPostReactionController {
  async memberPostReacts(req: Request, res: Response) {
    const filters = req.body.params.filters;

    const socialPostIdMatch = filters.match(
      /\('social_post_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );
    const shopPostIdMatch = filters.match(
      /\('shop_post_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );
    const commentIdMatch = filters.match(
      /\('comment_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );

    const socialPostId = socialPostIdMatch
      ? Number(socialPostIdMatch[1])
      : undefined;
    const shopPostId = shopPostIdMatch ? Number(shopPostIdMatch[1]) : undefined;
    const commentId = commentIdMatch ? Number(commentIdMatch[1]) : undefined;

    if (commentId) {
      const comment = await prisma.postComment.findUnique({
        where: {
          id: commentId,
        },
      });

      const reactions = await prisma.postCommentReaction.findMany({
        where: {
          postCommentId: commentId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: true,
          data: {
            count: reactions.length,
            results: reactions.map((reaction) => {
              return {
                id: reaction.id,
                create_uid: {
                  id: reaction.member.id,
                  name: reaction.member.name,
                  image_1920: reaction.member.profile?.coverPhoto ?? "",
                },
                partner_id: {
                  id: reaction.member.id,
                  name: reaction.member.name,
                  image_1920: reaction.member.profile?.coverPhoto ?? "",
                },
                social_post_id: {
                  id: null,
                  caption: null,
                },
                shop_post_id: {
                  id: null,
                  caption: null,
                },
                comment_id: {
                  id: comment?.id ?? null,
                  name: comment?.comment ?? null,
                },
              };
            }),
          },
        },
      });
    }

    const postId = socialPostId ?? shopPostId;

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        ...(socialPostId ? { shopId: null } : { shopId: { not: null } }),
      },
    });

    const reactions = await prisma.postReaction.findMany({
      where: {
        postId: postId,
        ...(socialPostId ? { type: "social" } : { type: "shop" }),
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count: reactions.length,
          results: reactions.map((reaction) => {
            return {
              id: reaction.id,
              create_uid: {
                id: reaction.member.id,
                name: reaction.member.name,
                image_1920: reaction.member.profile?.coverPhoto ?? "",
              },
              partner_id: {
                id: reaction.member.id,
                name: reaction.member.name,
                image_1920: reaction.member.profile?.coverPhoto ?? "",
              },
              social_post_id:
                socialPostId
                  ? {
                      id: post?.id ?? null,
                      caption: post?.caption ?? null,
                    }
                  : {
                      id: null,
                      caption: null,
                    },
              shop_post_id:
                shopPostId
                  ? {
                      id: post?.id ?? null,
                      caption: post?.caption ?? null,
                    }
                  : {
                      id: null,
                      caption: null,
                    },
              comment_id: {
                id: null,
                name: null,
              },
            };
          }),
        },
      },
    });
  }

  async memberPostReactCheck(req: Request, res: Response) {
    const { data, error, success } = await validater(
      checkMemberSocialPostReactSchema,
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

    const memberId = +(req.user as Member).id;
    let reactionId = null;
    let socialPost = null;
    let shopPost = null;
    let comment = null;

    if (data.type === "social") {
      socialPost = await prisma.post.findFirst({
        where: {
          id: +data.social_post_id!,
          shopId: null,
        },
      });

      if (!socialPost) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Social post not found",
          },
        });
      }

      const existingReaction = await prisma.postReaction.findFirst({
        where: {
          postId: socialPost.id,
          memberId,
        },
      });

      if (existingReaction) {
        await prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        const newReaction = await prisma.postReaction.create({
          data: {
            postId: socialPost.id,
            memberId,
            reaction: data.react_id,
            type: "social",
          },
        });
        reactionId = newReaction.id;
      }
    }

    if (data.type === "shop") {
      shopPost = await prisma.post.findFirst({
        where: {
          id: +data.shop_post_id!,
          shopId: { not: null },
        },
      });

      if (!shopPost) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Shop post not found",
          },
        });
      }

      const existingReaction = await prisma.postReaction.findFirst({
        where: {
          postId: shopPost.id,
          memberId,
        },
      });

      if (existingReaction) {
        await prisma.postReaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        const newReaction = await prisma.postReaction.create({
          data: {
            postId: shopPost.id,
            memberId,
            reaction: data.react_id,
            type: "shop",
          },
        });
        reactionId = newReaction.id;
      }
    }

    if (data.type === "comment") {
      comment = await prisma.postComment.findUnique({
        where: {
          id: +data.comment_id!,
        },
      });

      if (!comment) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Comment not found",
          },
        });
      }

      const existingReaction = await prisma.postCommentReaction.findFirst({
        where: {
          postCommentId: comment.id,
          memberId,
        },
      });

      if (existingReaction) {
        await prisma.postCommentReaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        const newReaction = await prisma.postCommentReaction.create({
          data: {
            postCommentId: comment.id,
            memberId,
            reaction: data.react_id,
          },
        });
        reactionId = newReaction.id;
      }
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        profile: true,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: reactionId,
          create_uid: {
            id: member?.id,
            name: member?.name,
            image_1920: member?.profile?.coverPhoto ?? "",
          },
          partner_id: {
            id: member?.id,
            name: member?.name,
            image_1920: member?.profile?.coverPhoto ?? "",
          },
          social_post_id:
            data.type === "social"
              ? {
                  id: socialPost?.id ?? null,
                  caption: socialPost?.caption ?? null,
                }
              : {
                  id: null,
                  caption: null,
                },
          shop_post_id:
            data.type === "shop"
              ? {
                  id: shopPost?.id ?? null,
                  caption: shopPost?.caption ?? null,
                }
              : {
                  id: null,
                  caption: null,
                },
          comment_id:
            data.type === "comment"
              ? {
                  id: comment?.id ?? null,
                  name: comment?.comment ?? null,
                }
              : {
                  id: null,
                  name: null,
                },
        },
      },
    });
  }
}

export default MemberSocialPostReactionController;
