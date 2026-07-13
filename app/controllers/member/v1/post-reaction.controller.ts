import { Request, Response } from "express";
import { Member, Prisma } from "@prisma/client";
import PostReactionService from "../../../services/member/v1/post-reaction.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { BadRequestException, ValidationException } from "../../../helpers/exceptions";
import { createPostReactionSchema } from "../../../schemas/member/v1/post-reaction.schema";
import { PostReactionResource } from "../../../resources/member/v1/post-reaction/post-reaction.resource";
import prisma from "../../../../prisma/client";

class PostReactionController {
    private postReactionService: PostReactionService;

    constructor() {
        this.postReactionService = new PostReactionService();
    }

    private caption(caption: unknown) {
        if (caption == null || caption === "") return null;
        if (typeof caption === "string") return caption;
        if (typeof caption === "object" && caption !== null && "caption" in caption) {
            const c = (caption as Record<string, unknown>).caption;
            return c != null ? String(c) : null;
        }
        return String(caption);
    }

    private filterValue(filters: unknown, fieldName: string) {
        const filtersStr =
            typeof filters === "string" ? filters : JSON.stringify(filters ?? "[]");
        const tupleRe =
            /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;

        let match: RegExpExecArray | null;
        while ((match = tupleRe.exec(filtersStr)) !== null) {
            const field = match[1];
            const op = match[2];
            const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");
            if (field === fieldName && op === "=") {
                const id = Number(value);
                return Number.isInteger(id) && id > 0 ? id : null;
            }
        }

        return null;
    }

    private memberImage(member: {
        id: number;
        profile: { profilePhoto: string | null } | null;
    }) {
        return member.profile?.profilePhoto ?? "";
    }

    private formatMemberPostReact(reaction: {
        id: number;
        member: {
            id: number;
            name: string;
            profile: { profilePhoto: string | null } | null;
        };
        post: {
            id: number;
            caption: Prisma.JsonValue;
            shopId: number | null;
        };
    }) {
        const memberInfo = {
            image_1920: this.memberImage(reaction.member),
            name: reaction.member.name,
            id: reaction.member.id,
        };
        const postCaption = this.caption(reaction.post.caption);

        return {
            id: reaction.id,
            create_uid: memberInfo,
            partner_id: memberInfo,
            social_post_id: {
                caption: reaction.post.shopId ? null : postCaption,
                id: reaction.post.shopId ? null : reaction.post.id,
            },
            shop_post_id: {
                caption: reaction.post.shopId ? postCaption : null,
                id: reaction.post.shopId ? reaction.post.id : null,
            },
            comment_id: {
                name: null,
                id: null,
            },
        };
    }

    private formatMemberCommentReact(reaction: {
        id: number;
        member: {
            id: number;
            name: string;
            profile: { profilePhoto: string | null } | null;
        };
        postComment: {
            id: number;
            comment: string;
        };
    }) {
        const memberInfo = {
            image_1920: this.memberImage(reaction.member),
            name: reaction.member.name,
            id: reaction.member.id,
        };

        return {
            id: reaction.id,
            create_uid: memberInfo,
            partner_id: memberInfo,
            social_post_id: {
                caption: null,
                id: null,
            },
            shop_post_id: {
                caption: null,
                id: null,
            },
            comment_id: {
                name: reaction.postComment.comment,
                id: reaction.postComment.id,
            },
        };
    }

    async memberPostReactCheck(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const params = req.body?.params ?? {};
        const type = String(params.type ?? "social").toLowerCase();
        const reactId = Number(params.react_id) || 1;

        if (type === "comment") {
            const commentId = Number(params.comment_id) || null;

            if (!commentId) {
                return res.json({
                    jsonrpc: "2.0",
                    id: null,
                    result: {
                        isFullFilled: false,
                        message: "comment_id is required",
                        data: null,
                    },
                });
            }

            const postComment = await prisma.postComment.findUnique({
                where: { id: commentId },
                select: { id: true },
            });

            if (!postComment) {
                return res.json({
                    jsonrpc: "2.0",
                    id: null,
                    result: {
                        isFullFilled: false,
                        message: "Comment not found",
                        data: null,
                    },
                });
            }

            const reaction = await prisma.postCommentReaction.upsert({
                where: {
                    postCommentId_memberId: {
                        postCommentId: commentId,
                        memberId,
                    },
                },
                create: {
                    postCommentId: commentId,
                    memberId,
                    reaction: String(reactId),
                },
                update: {
                    reaction: String(reactId),
                },
                include: {
                    member: {
                        select: {
                            id: true,
                            name: true,
                            profile: { select: { profilePhoto: true } },
                        },
                    },
                    postComment: {
                        select: {
                            id: true,
                            comment: true,
                        },
                    },
                },
            });

            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: true,
                    data: this.formatMemberCommentReact(reaction),
                },
            });
        }

        const postId =
            type === "shop"
                ? Number(params.shop_post_id) || null
                : Number(params.social_post_id) || null;

        if (!postId || !["social", "shop"].includes(type)) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    isFullFilled: false,
                    message: "Provide social_post_id, shop_post_id, or comment_id with a valid type",
                    data: null,
                },
            });
        }

        const post = await prisma.post.findFirst({
            where:
                type === "shop"
                    ? { id: postId, shopId: { not: null } }
                    : { id: postId, shopId: null },
            select: { id: true },
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

        const reaction = await prisma.postReaction.upsert({
            where: {
                postId_memberId: {
                    postId,
                    memberId,
                },
            },
            create: {
                postId,
                memberId,
            },
            update: {},
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        profile: { select: { profilePhoto: true } },
                    },
                },
                post: {
                    select: {
                        id: true,
                        caption: true,
                        shopId: true,
                    },
                },
            },
        });

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data: this.formatMemberPostReact(reaction),
            },
        });
    }

    async memberPostReacts(req: Request, res: Response) {
        const params =
            req.method === "GET" && Object.keys(req.query).length
                ? req.query
                : req.body?.params ?? {};
        const socialPostId = this.filterValue(params.filters, "social_post_id");
        const shopPostId = this.filterValue(params.filters, "shop_post_id");
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

        const where: Prisma.PostReactionWhereInput = {
            postId: socialPostId ?? shopPostId ?? 0,
            post: socialPostId ? { shopId: null } : { shopId: { not: null } },
        };

        const [count, reactions] = await Promise.all([
            prisma.postReaction.count({ where }),
            prisma.postReaction.findMany({
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
                    post: {
                        select: {
                            id: true,
                            caption: true,
                            shopId: true,
                        },
                    },
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
                    results: reactions.map((reaction) =>
                        this.formatMemberPostReact(reaction)
                    ),
                },
            },
        });
    }

    async findAll(req: Request, res: Response) {
        const { postId } = req.query;

        if (!postId) {
            throw new BadRequestException("Post id query parameter is required");
        }

        const reactions = await this.postReactionService.findAll(+postId);

        return successResponse(res, "Post reactions retrieved successfully", reactions.map(PostReactionResource.toResource));
    }

    async findOne(req: Request, res: Response) {
        const reaction = await this.postReactionService.findOne(+req.params.id);
        return successResponse(res, "Post reaction retrieved successfully", PostReactionResource.toResource(reaction));
    }

    async create(req: Request, res: Response) {
        const { data, success, error } = await validater(createPostReactionSchema, req.body);
        if (!success) {
            throw new ValidationException("Failed to toggle post reaction", error);
        }
        const memberId = (req.user as Member).id;
        const reaction = await this.postReactionService.give(data, memberId);
        if (reaction) {
            return successResponse(res, "Post reaction added successfully", PostReactionResource.toResource(reaction));
        }
        return successResponse(res, "Post reaction removed successfully");
    }

    async destroy(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        await this.postReactionService.destroy(+req.params.id, memberId);
        return successResponse(res, "Post reaction deleted successfully");
    }
}

export default PostReactionController;
