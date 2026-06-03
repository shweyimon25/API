import { Request, Response } from "express";
import { Member, Prisma } from "@prisma/client";
import PostCommentService from "../../../services/member/v1/post-comment.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import {
  createPostCommentSchema,
  updatePostCommentSchema,
} from "../../../schemas/member/v1/post-comment.schema";
import { PostCommentResource } from "../../../resources/member/v1/post-comment/post-comment.resource";
import prisma from "../../../../prisma/client";

type MemberPostCommentRow = {
  id: number;
  comment: string;
  createdAt: Date;
  member: {
    id: number;
    name: string;
    profile: { profilePhoto: string | null } | null;
  };
  parent: { id: number; comment: string } | null;
  post: {
    id: number;
    content: Prisma.JsonValue;
    shopId: number | null;
    postReactions: { id: number }[];
  };
  postCommentReactions: { memberId: number }[];
  _count: { postCommentReactions: number; replies: number };
  replies?: MemberPostCommentRow[];
};

class PostCommentController {
  private postCommentService: PostCommentService;

  constructor() {
    this.postCommentService = new PostCommentService();
  }

  private formatDate(d: Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  private caption(content: unknown) {
    if (content == null || content === "") return null;
    if (typeof content === "string") return content;
    if (typeof content === "object" && content !== null && "caption" in content) {
      const c = (content as Record<string, unknown>).caption;
      return c != null ? String(c) : null;
    }
    return String(content);
  }

  private resolveParams(req: Request) {
    const body = req.body ?? {};
    let params = body.params;

    if (typeof params === "string") {
      try {
        params = JSON.parse(params);
      } catch {
        params = undefined;
      }
    }

    if (params && typeof params === "object") {
      return params as Record<string, unknown>;
    }

    return body as Record<string, unknown>;
  }

  private filterValue(filters: unknown, fieldName: string) {
    if (filters == null || filters === "") return null;

    if (Array.isArray(filters)) {
      for (const row of filters) {
        if (!Array.isArray(row) || row.length < 3) continue;
        const field = String(row[0]);
        const op = String(row[1]);
        if (field === fieldName && op === "=") {
          const id = Number(row[2]);
          if (Number.isInteger(id) && id > 0) return id;
        }
      }
      return null;
    }

    const filtersStr =
      typeof filters === "string" ? filters : JSON.stringify(filters);
    const tupleRe =
      /\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*(?:['"]([^'"]*)['"]|([^)\s,]+))\s*\)/g;

    let match: RegExpExecArray | null;
    while ((match = tupleRe.exec(filtersStr)) !== null) {
      const field = match[1];
      const op = match[2];
      const value = (match[3] ?? match[4] ?? "").trim().replace(/^['"]|['"]$/g, "");
      if (field === fieldName && op === "=") {
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
      }
    }

    return null;
  }

  private postIdFromParams(params: Record<string, unknown>) {
    const socialPostId =
      this.filterValue(params.filters, "social_post_id") ??
      (Number(params.social_post_id) > 0 ? Number(params.social_post_id) : null);
    const shopPostId =
      this.filterValue(params.filters, "shop_post_id") ??
      (Number(params.shop_post_id) > 0 ? Number(params.shop_post_id) : null);

    return { socialPostId, shopPostId };
  }

  private memberInfo(member: MemberPostCommentRow["member"]) {
    return {
      name: member.name,
      id: member.id,
      image_1920: member.profile?.profilePhoto ?? "",
    };
  }

  private commentInclude(memberId: number) {
    return {
      member: {
        select: {
          id: true,
          name: true,
          profile: { select: { profilePhoto: true } },
        },
      },
      parent: { select: { id: true, comment: true } },
      post: {
        select: {
          id: true,
          content: true,
          shopId: true,
          postReactions: { where: { memberId }, select: { id: true } },
        },
      },
      postCommentReactions: { select: { memberId: true } },
      _count: { select: { postCommentReactions: true, replies: true } },
      replies: {
        orderBy: { createdAt: "asc" as const },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              profile: { select: { profilePhoto: true } },
            },
          },
          parent: { select: { id: true, comment: true } },
          post: {
            select: {
              id: true,
              content: true,
              shopId: true,
              postReactions: { where: { memberId }, select: { id: true } },
            },
          },
          postCommentReactions: { select: { memberId: true } },
          _count: { select: { postCommentReactions: true, replies: true } },
        },
      },
    };
  }

  private formatMemberPostComment(
    comment: MemberPostCommentRow,
    memberId: number
  ): Record<string, unknown> {
    const isShop = comment.post.shopId != null;
    const postCaption = this.caption(comment.post.content);
    const member = this.memberInfo(comment.member);
    const postIsReact = comment.post.postReactions.length > 0;

    return {
      id: comment.id,
      name: comment.comment,
      type: isShop ? "shop" : "social",
      is_react: comment.postCommentReactions.some((r) => r.memberId === memberId),
      react_count: comment._count.postCommentReactions,
      create_date: this.formatDate(comment.createdAt),
      mentioned_users: null,
      create_uid: member,
      partner_id: member,
      social_post_id: {
        is_react: postIsReact,
        id: isShop ? null : comment.post.id,
        caption: isShop ? null : postCaption,
      },
      shop_post_id: {
        id: isShop ? comment.post.id : null,
        caption: isShop ? postCaption : null,
      },
      parent_command_id: {
        name: comment.parent?.comment ?? null,
        id: comment.parent?.id ?? null,
      },
      child_comment_count: comment._count.replies,
      child_comment_line: (comment.replies ?? []).map((reply) =>
        this.formatMemberPostComment({ ...reply, replies: [] }, memberId)
      ),
    };
  }

  private formatMemberPostCommentResult(
    comment: MemberPostCommentRow,
    memberId: number
  ) {
    const formatted = this.formatMemberPostComment(
      { ...comment, replies: comment.replies ?? [] },
      memberId
    );

    return {
      ...formatted,
      is_react: null,
      mentioned_users: null,
      social_post_id: {
        ...(formatted.social_post_id as Record<string, unknown>),
        is_react: null,
      },
    };
  }

  async memberPostComments(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const params = this.resolveParams(req);
    const { socialPostId, shopPostId } = this.postIdFromParams(params);
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

    const postId = socialPostId ?? shopPostId ?? 0;
    const where: Prisma.PostCommentWhereInput = {
      postId,
      parentId: null,
    };

    const include = this.commentInclude(memberId);

    const [count, comments] = await Promise.all([
      prisma.postComment.count({ where }),
      prisma.postComment.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: offset,
        take: limit,
        include,
      }),
    ]);

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count,
          results: comments.map((comment) =>
            this.formatMemberPostComment(
              { ...comment, replies: comment.replies ?? [] },
              memberId
            )
          ),
        },
      },
    });
  }

  async memberPostCommentCreate(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const params = req.body?.params ?? {};
    const name = String(params.name ?? "").trim();
    const socialPostId = Number(params.social_post_id) || null;
    const shopPostId = Number(params.shop_post_id) || null;
    const parentId =
      Number(params.parent_command_id) ||
      Number(params.parent_comment_id) ||
      null;

    if (!name) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Comment name is required",
          data: null,
        },
      });
    }

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

    if (parentId) {
      const parent = await prisma.postComment.findFirst({
        where: { id: parentId, postId: post.id },
      });

      if (!parent) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Parent comment not found",
            data: null,
          },
        });
      }
    }

    const created = await prisma.postComment.create({
      data: {
        postId: post.id,
        memberId,
        comment: name,
        parentId,
      },
      include: this.commentInclude(memberId),
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: this.formatMemberPostCommentResult(
          { ...created, replies: created.replies ?? [] },
          memberId
        ),
      },
    });
  }

  async memberPostCommentUpdate(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const commentId = +req.params.id;
    const params = this.resolveParams(req);
    const name = String(params.name ?? "").trim();

    if (!commentId) {
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

    if (!name) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Comment name is required",
          data: null,
        },
      });
    }

    const existing = await prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
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

    if (existing.memberId !== memberId) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You can only update your own comments",
          data: null,
        },
      });
    }

    const updated = await prisma.postComment.update({
      where: { id: commentId },
      data: { comment: name },
      include: this.commentInclude(memberId),
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Update Successfully.",
        data: this.formatMemberPostCommentResult(
          { ...updated, replies: updated.replies ?? [] },
          memberId
        ),
      },
    });
  }

  async memberPostCommentDelete(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const commentId = +req.params.id;

    if (!commentId) {
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

    const existing = await prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
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

    if (existing.memberId !== memberId) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You can only delete your own comments",
          data: null,
        },
      });
    }

    await prisma.postComment.delete({ where: { id: commentId } });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Delete Successfully.",
      },
    });
  }

  async findAll(req: Request, res: Response) {
    const { postId } = req.query;
    if (postId == null || postId === "") {
      throw new ValidationException("Failed to list post comments", [
        { field: "postId", issue: "Post ID is required" },
      ]);
    }
    const comments = await this.postCommentService.listByPostId(+postId);
    return successResponse(res, "Post comments list successfully", comments);
  }

  async findOne(req: Request, res: Response) {
    const comment = await this.postCommentService.findOne(+req.params.id);
    return successResponse(
      res,
      "Post comment fetched successfully",
      PostCommentResource.toResource(comment)
    );
  }

  async create(req: Request, res: Response) {
    const { data, success, error } = await validater(
      createPostCommentSchema,
      req.body
    );
    if (!success) {
      throw new ValidationException("Failed to create post comment", error);
    }
    const memberId = (req.user as Member).id;
    const comment = await this.postCommentService.create(data, memberId);
    return successResponse(
      res,
      "Post comment created successfully",
      PostCommentResource.toResource(comment)
    );
  }

  async update(req: Request, res: Response) {
    const { data, success, error } = await validater(
      updatePostCommentSchema,
      req.body
    );
    if (!success) {
      throw new ValidationException("Failed to update post comment", error);
    }
    const memberId = (req.user as Member).id;
    const comment = await this.postCommentService.update(
      +req.params.id,
      data,
      memberId
    );
    return successResponse(
      res,
      "Post comment updated successfully",
      PostCommentResource.toResource(comment)
    );
  }

  async destroy(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    await this.postCommentService.destroy(+req.params.id, memberId);
    return successResponse(res, "Post comment deleted successfully");
  }
}

export default PostCommentController;
