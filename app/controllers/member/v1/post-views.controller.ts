import { Request, Response } from "express";
import { Member, Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";

class PostViewsController {

    private caption(content: unknown) {
        if (content == null || content === "") return null;
        if (typeof content === "string") return content;
        if (typeof content === "object" && content !== null && "caption" in content) {
            const c = (content as Record<string, unknown>).caption;
            return c != null ? String(c) : null;
        }
        return String(content);
    }


    private formatPostViews(view: {
        id: number;
        member: {
        id: number;
        name: string;
        profile: { profilePhoto: string | null } | null;
        };
        socialPost: { id: number; content: unknown; media: unknown } | null;
        shopPost: { id: number; content: unknown; media: unknown } | null;
    }) {

        return {
        id: view.id,
        create_uid: {
            id: view.member.id,
            name: view.member.name,
            image_1920:
            view.member.profile?.profilePhoto ?? '',
        },
        partner_id: {
            id: view.member.id,
            name: view.member.name,
            image_1920:
            view.member.profile?.profilePhoto ?? '',
        },
        social_post_id: {
            id: view.socialPost?.id ?? null,
            caption: view.socialPost ? this.caption(view.socialPost.content) : null,
            react_count: 0,
            view_count: 0,
            comment_count: 0,
            share_count: 0
        },
        shop_post_id: {
            id: view.shopPost?.id ?? null,
            caption: view.shopPost ? this.caption(view.shopPost.content) : null,
            react_count: 0,
            view_count: 0,
            comment_count: 0,
            share_count: 0
        }
        };
    }

    private async getPostViewsCount(socialPostId: number | null, shopPostId: number | null) {
        const where: Prisma.PostViewsWhereInput = socialPostId
        ? {
            socialPostId: socialPostId,
            }
        : {
            shopPostId: shopPostId ?? 0,
            };

        return await prisma.postViews.count({ where });
    }

    async memberPostViews(req: Request, res: Response) {
        const params =
            req.method === "GET" && Object.keys(req.query).length
                ? req.query
                : req.body?.params ?? {};
        const socialPostId = Number(params.social_post_id) || null;
        const shopPostId = Number(params.shop_post_id) || null;
        const offset = Math.max(0, Number(params.offset) || 0);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 100));

        if ((!socialPostId && !shopPostId) || (socialPostId && shopPostId)) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Provide either social_post_id or shop_post_id filter",
                    data: null,
                },
            });
        }
        const post = await prisma.post.findFirst({
        where: socialPostId
            ? { id: socialPostId, shopId: null }
            : { id: shopPostId ?? 0, shopId: { not: null } },
        });

        if (!post) {
        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
            isFullFilled: false,
            message: "Post not found",
            data: null,
            },
        });
        }

        const where: Prisma.PostViewsWhereInput = socialPostId
        ? {
            socialPostId: socialPostId,
            }
        : {
            shopPostId: shopPostId ?? 0,
            };

        const [count, views] = await Promise.all([
            prisma.postViews.count({ where }),
            prisma.postViews.findMany({
                where,
                orderBy: { createdAt: "asc" },
                skip: offset,
                take: limit,
                include: {
                    member: {
                        select: {
                        id: true,
                        name: true,
                        profile: { select: { profilePhoto: true } },
                        },
                    },
                    socialPost: { select: { id: true, content: true, media: true } },
                    shopPost: { select: { id: true, content: true, media: true } },
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
                    results: views.map((view) =>
                        this.formatPostViews(view)
                    ),
                },
            },
        });
    }

    async memberPostViewsCheck(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const params = req.body?.params ?? req.body ?? {};
        const socialPostId = Number(params.social_post_id) || null;
        const shopPostId = Number(params.shop_post_id) || null;

        if ((!socialPostId && !shopPostId) || (socialPostId && shopPostId)) {
        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
            isFullFilled: false,
            message: "Provide either social_post_id or shop_post_id",
            data: null,
            },
        });
        }

        const post = await prisma.post.findFirst({
        where: socialPostId
            ? { id: socialPostId, shopId: null }
            : { id: shopPostId ?? 0, shopId: { not: null } },
        });

        if (!post) {
        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
            isFullFilled: false,
            message: "Post not found",
            data: null,
            },
        });
        }

        const include = {
        member: {
            select: {
            id: true,
            name: true,
            profile: { select: { profilePhoto: true } },
            },
        },
        socialPost: { select: { id: true, content: true, media: true } },
        shopPost: { select: { id: true, content: true, media: true } },
        };

        const view = socialPostId
        ? await prisma.postViews.upsert({
            where: {
                memberId_socialPostId: { memberId, socialPostId },
            },
            create: { memberId, socialPostId },
            update: {},
            include,
            })
        : await prisma.postViews.upsert({
            where: {
                memberId_shopPostId: { memberId, shopPostId: shopPostId ?? 0 },
            },
            create: { memberId, shopPostId },
            update: {},
            include,
            });

        return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
            isFullFilled: true,
            data: {view_count: await this.getPostViewsCount(socialPostId, shopPostId), results: []},
        },
        });
    }

}

export default PostViewsController;
