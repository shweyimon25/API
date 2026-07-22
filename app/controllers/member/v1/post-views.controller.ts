import { Request, Response } from "express";
import { Member } from "@prisma/client";
import prisma from "../../../../prisma/client";

class PostViewsController {
  async memberPostViews(req: Request, res: Response) {
    const filters = req.body.params.filters;
    const offset = req.body.params.offset;
    const limit = req.body.params.limit;

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

    if ((!socialPostId && !shopPostId) || (socialPostId && shopPostId)) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Provide either social_post_id or shop_post_id filter",
        },
      });
    }

    const post = await prisma.post.findFirst({
      where: socialPostId
        ? { id: socialPostId, shopId: null }
        : { id: shopPostId, shopId: { not: null } },
    });

    if (!post) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Post not found",
        },
      });
    }

    const skip = Math.max(0, Number(offset) || 0);
    const take = Math.max(1, Number(limit) || 20);

    const where = socialPostId
      ? { socialPostId }
      : { shopPostId: shopPostId! };

    const [count, views] = await Promise.all([
      prisma.postViews.count({ where }),
      prisma.postViews.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take,
        include: {
          member: {
            include: {
              profile: true,
            },
          },
          socialPost: true,
          shopPost: true,
        },
      }),
    ]);

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count,
          results: views.map((view) => {
            return {
              id: view.id,
              create_uid: {
                id: view.member.id,
                name: view.member.name,
                image_1920: view.member.profile?.coverPhoto ?? "",
              },
              partner_id: {
                id: view.member.id,
                name: view.member.name,
                image_1920: view.member.profile?.coverPhoto ?? "",
              },
              social_post_id: {
                id: view.socialPost?.id ?? null,
                caption: view.socialPost?.caption ?? null,
                react_count: 0,
                view_count: view.socialPost?.viewCount ?? 0,
                comment_count: 0,
                share_count: 0,
              },
              shop_post_id: {
                id: view.shopPost?.id ?? null,
                caption: view.shopPost?.caption ?? null,
                react_count: 0,
                view_count: view.shopPost?.viewCount ?? 0,
                comment_count: 0,
                share_count: 0,
              },
            };
          }),
        },
      },
    });
  }

  async memberPostViewsCheck(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const socialPostId = req.body.params.social_post_id
      ? Number(req.body.params.social_post_id)
      : undefined;
    const shopPostId = req.body.params.shop_post_id
      ? Number(req.body.params.shop_post_id)
      : undefined;

    if ((!socialPostId && !shopPostId) || (socialPostId && shopPostId)) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Provide either social_post_id or shop_post_id",
        },
      });
    }

    const post = await prisma.post.findFirst({
      where: socialPostId
        ? { id: socialPostId, shopId: null }
        : { id: shopPostId, shopId: { not: null } },
    });

    if (!post) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Post not found",
        },
      });
    }

    const existingView = socialPostId
      ? await prisma.postViews.findUnique({
          where: {
            memberId_socialPostId: {
              memberId,
              socialPostId,
            },
          },
        })
      : await prisma.postViews.findUnique({
          where: {
            memberId_shopPostId: {
              memberId,
              shopPostId: shopPostId!,
            },
          },
        });

    let currentViewCount = post.viewCount;

    if (!existingView) {
      const [_, updatedPost] = await prisma.$transaction([
        socialPostId
          ? prisma.postViews.create({
              data: {
                memberId,
                socialPostId,
              },
            })
          : prisma.postViews.create({
              data: {
                memberId,
                shopPostId,
              },
            }),
        prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        }),
      ]);

      currentViewCount = updatedPost.viewCount;
    }

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          view_count: currentViewCount,
          results: [],
        },
      },
    });
  }
}

export default PostViewsController;
