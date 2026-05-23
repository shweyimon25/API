import { Request, Response } from "express";
import { Member, Prisma, PrivencyType } from "@prisma/client";
import PostService from "../../../services/member/v1/post.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createPostSchema,
  updatePostSchema,
} from "../../../schemas/member/v1/post.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { PostCollection } from "../../../resources/member/v1/post/post.collection";
import { PostResource } from "../../../resources/member/v1/post/post.resource";
import { memberPostScope } from "../../../scopes/member/v1/post.scope";
import { upload } from "../../../helpers/media-upload";
import prisma from "../../../../prisma/client";

class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  private socialPostInclude(memberId: number) {
    return {
      member: {
        select: {
          id: true,
          name: true,
          profile: { select: { profilePhoto: true } },
        },
      },
      tag: { select: { name: true } },
      postReactions: { where: { memberId }, select: { id: true } },
      _count: { select: { postReactions: true, postComments: true } },
    };
  }

  private emptySharePost() {
    return {
      id: null,
      caption: null,
      create_uid: null,
      partner_id: {
        id: null,
        name: null,
        image_1920:
          "http://localhost:8069/web/image/?model=res.partner&id=False&field=image_1920",
      },
      view_type: null,
      post_category: null,
      create_date: null,
      media_line: [],
      view_count: 0,
      react_count: 0,
      comment_count: 0,
      share_count: 0,
      is_react: null,
      is_reels: null,
    };
  }

  private formatSocialPost(post: {
    id: number;
    content: unknown;
    memberId: number;
    privencyType: string | null;
    media: unknown;
    viewCount: number;
    createdAt: Date;
    member: {
      id: number;
      name: string;
      profile: { profilePhoto: string | null } | null;
    } | null;
    tag: { name: string } | null;
    postReactions: { id: number }[];
    _count: { postReactions: number; postComments: number };
  }) {
    const formatDate = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };

    const caption = (content: unknown) => {
      if (content == null || content === "") return null;
      if (typeof content === "string") return content;
      if (typeof content === "object" && content !== null && "caption" in content) {
        const c = (content as Record<string, unknown>).caption;
        return c != null ? String(c) : null;
      }
      return String(content);
    };

    const viewType = (t: string | null | undefined) => {
      if (t === "PRIVATE") return "only_me";
      if (t === "FRIEND") return "friend";
      return "public";
    };

    const mediaLine = (media: unknown) => {
      const items = Array.isArray(media) ? media : [];
      return items.map((item) => {
        if (item && typeof item === "object") {
          const m = item as Record<string, unknown>;
          return {
            image: (m.image as string) ?? null,
            video: (m.video as string) ?? null,
            thumbnail_url:
              (m.thumbnail_url as string) ?? (m.thumbnail as string) ?? null,
            video_duration: (m.video_duration as string) ?? null,
          };
        }
        const url = String(item);
        const isVideo = /\.(mp4|mov|webm|mkv)(\?|$)/i.test(url);
        return {
          image: isVideo ? null : url,
          video: isVideo ? url : null,
          thumbnail_url: null,
          video_duration: null,
        };
      });
    };

    return {
      id: post.id,
      caption: caption(post.content),
      create_uid: post.memberId,
      partner_id: {
        id: post.member?.id ?? null,
        name: post.member?.name ?? null,
        image_1920: post.member?.profile?.profilePhoto ?? null,
      },
      view_type: viewType(post.privencyType),
      post_category: post.tag?.name?.toLowerCase() ?? "home",
      is_save: null,
      saved_post_id: null,
      create_date: formatDate(post.createdAt),
      media_line: mediaLine(post.media),
      view_count: post.viewCount ?? 0,
      react_count: post._count.postReactions,
      comment_count: post._count.postComments,
      share_count: 0,
      is_react: post.postReactions.length > 0 ? true : null,
      is_reels: null,
      share_post_id: this.emptySharePost(),
    };
  }

  async memberSocialPosts(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const params = req.body?.params ?? {};
    const offset = Math.max(0, Number(params.offset) || 0);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const orderStr = String(params.order ?? "create_date desc");
    const filtersRaw = params.filters ?? "[]";
    const filtersStr =
      typeof filtersRaw === "string" ? filtersRaw : JSON.stringify(filtersRaw);

    const tupleRe =
      /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(?:'([^']*)'|([^)]+))\s*\)/g;
    const orSearch: Prisma.PostWhereInput[] = [];
    let postCategory: string | undefined;

    let match: RegExpExecArray | null;
    while ((match = tupleRe.exec(filtersStr)) !== null) {
      const field = match[1];
      const op = match[2];
      const value = (match[3] ?? match[4] ?? "").trim().replace(/^'|'$/g, "");
      if (!value) continue;

      if (field === "post_category" && op === "=") {
        postCategory = value;
        continue;
      }
      if (field === "caption" && op === "ilike") {
        orSearch.push(
          { content: { string_contains: value } },
          { content: { path: ["caption"], string_contains: value } }
        );
        continue;
      }
      if (field === "partner_id.name" && op === "ilike") {
        orSearch.push({
          member: { name: { contains: value, mode: "insensitive" } },
        });
        continue;
      }
      if (field === "partner_id.client_code" && (op === "=" || op === "ilike")) {
        orSearch.push({
          member: {
            code:
              op === "="
                ? { equals: value, mode: "insensitive" }
                : { contains: value, mode: "insensitive" },
          },
        });
      }
    }

    const and: Prisma.PostWhereInput[] = [
      { shopId: null, privencyType: PrivencyType.PUBLIC },
    ];
    if (postCategory) {
      and.push({
        tag: { name: { equals: postCategory, mode: "insensitive" } },
      });
    }
    if (orSearch.length) {
      and.push({ OR: orSearch });
    }

    const where: Prisma.PostWhereInput = { AND: and };
    const [orderField, orderDirRaw] = orderStr.trim().split(/\s+/);
    const orderDir =
      (orderDirRaw ?? "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const orderBy: Prisma.PostOrderByWithRelationInput =
      orderField === "id" ? { id: orderDir } : { createdAt: orderDir };

    const include = this.socialPostInclude(memberId);

    const [posts, count] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include,
      }),
      prisma.post.count({ where }),
    ]);

    const results = posts.map((post) => this.formatSocialPost(post));

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: { count, results },
      },
    });
  }

  async memberSocialPostDetail(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const postId = +req.params.id;

    if (!postId) {
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

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        shopId: null,
        OR: [
          { privencyType: PrivencyType.PUBLIC },
          { memberId },
          {
            privencyType: PrivencyType.FRIEND,
            member: {
              OR: [
                { friends: { some: { friendId: memberId } } },
                { friendsOf: { some: { memberId } } },
              ],
            },
          },
        ],
      },
      include: this.socialPostInclude(memberId),
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

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
      include: this.socialPostInclude(memberId),
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: this.formatSocialPost(updated),
      },
    });
  }

  async memberSocialPostCreate(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const caption = String(req.body.caption ?? "").trim();
    const viewTypeRaw = String(req.body.view_type ?? "public").toLowerCase();
    const postCategory = String(req.body.post_category ?? "home").toLowerCase();

    const viewTypeMap: Record<string, PrivencyType> = {
      public: PrivencyType.PUBLIC,
      only_me: PrivencyType.PRIVATE,
      friend: PrivencyType.FRIEND,
    };
    const privencyType = viewTypeMap[viewTypeRaw] ?? PrivencyType.PUBLIC;

    const files = (req.files as Express.Multer.File[]) ?? [];
    const imageFile = files.find(
      (f) =>
        f.fieldname === "media_line/image" ||
        f.fieldname === "media_line[image]"
    );
    const videoFile = files.find(
      (f) =>
        f.fieldname === "media_line/video" ||
        f.fieldname === "media_line[video]"
    );

    if (!caption && !imageFile && !videoFile) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Caption or media is required",
          data: null,
        },
      });
    }

    let tag = await prisma.tag.findFirst({
      where: { name: { equals: postCategory, mode: "insensitive" } },
    });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: postCategory } });
    }

    const mediaLine: Prisma.InputJsonValue[] = [];

    if (imageFile) {
      const { fileUrl } = await upload(imageFile, "post");
      mediaLine.push({
        image: fileUrl,
        video: null,
        thumbnail_url: null,
        video_duration: null,
      });
    }

    if (videoFile) {
      const { fileUrl } = await upload(videoFile, "post");
      mediaLine.push({
        image: null,
        video: fileUrl,
        thumbnail_url: null,
        video_duration: null,
      });
    }

    const created = await prisma.post.create({
      data: {
        content: caption,
        tagId: tag.id,
        privencyType,
        media: mediaLine,
        memberId,
        shopId: null,
      },
      include: this.socialPostInclude(memberId),
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: this.formatSocialPost(created),
      },
    });
  }

  async memberSocialPostUpdate(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const postId = +req.params.id;

    if (!postId) {
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

    const existing = await prisma.post.findFirst({
      where: { id: postId, shopId: null },
    });

    if (!existing) {
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

    if (existing.memberId !== memberId) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You can only update your own posts",
          data: null,
        },
      });
    }

    const viewTypeRaw = String(
      req.body.view_type ?? existing.privencyType ?? "public"
    ).toLowerCase();
    const postCategory = String(req.body.post_category ?? "home").toLowerCase();

    const viewTypeMap: Record<string, PrivencyType> = {
      public: PrivencyType.PUBLIC,
      only_me: PrivencyType.PRIVATE,
      friend: PrivencyType.FRIEND,
    };
    const privencyType = viewTypeMap[viewTypeRaw] ?? PrivencyType.PUBLIC;

    const files = (req.files as Express.Multer.File[]) ?? [];
    const imageFile = files.find(
      (f) =>
        f.fieldname === "media_line/image" ||
        f.fieldname === "media_line[image]"
    );
    const videoFile = files.find(
      (f) =>
        f.fieldname === "media_line/video" ||
        f.fieldname === "media_line[video]"
    );

    let tag = await prisma.tag.findFirst({
      where: { name: { equals: postCategory, mode: "insensitive" } },
    });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: postCategory } });
    }

    const content =
      req.body.caption !== undefined
        ? String(req.body.caption).trim()
        : existing.content;

    let mediaLine: Prisma.InputJsonValue[] = Array.isArray(existing.media)
      ? ([...existing.media] as Prisma.InputJsonValue[])
      : [];

    if (imageFile || videoFile) {
      mediaLine = [];
      if (imageFile) {
        const { fileUrl } = await upload(imageFile, "post");
        mediaLine.push({
          image: fileUrl,
          video: null,
          thumbnail_url: null,
          video_duration: null,
        });
      }
      if (videoFile) {
        const { fileUrl } = await upload(videoFile, "post");
        mediaLine.push({
          image: null,
          video: fileUrl,
          thumbnail_url: null,
          video_duration: null,
        });
      }
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        content: content as Prisma.InputJsonValue,
        tagId: tag.id,
        privencyType,
        media: mediaLine,
      },
      include: this.socialPostInclude(memberId),
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Update Successfully.",
        data: this.formatSocialPost(updated),
      },
    });
  }

  async memberSocialPostDelete(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const postId = +req.params.id;

    if (!postId) {
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

    const existing = await prisma.post.findFirst({
      where: { id: postId, shopId: null },
    });

    if (!existing) {
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

    if (existing.memberId !== memberId) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You can only delete your own posts",
          data: null,
        },
      });
    }

    await prisma.post.delete({ where: { id: postId } });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Delete Successfully.",
        data: null,
      },
    });
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    const where = memberPostScope(req.query);

    if (page && perPage) {
      const posts = await this.postService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "Post list successfully",
        PostCollection.withPagination(posts)
      );
    }

    const posts = await this.postService.findAll(where);
    return successResponse(
      res,
      "Post list successfully",
      PostCollection.toCollection(posts)
    );
  }

  async findOne(req: Request, res: Response) {
    const post = await this.postService.findOne(+req.params.id);
    return successResponse(
      res,
      "Post details successfully",
      PostResource.toResource(post)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createPostSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Failed to create post", error);
    }

    const memberId = (req.user as Member).id;
    const post = await this.postService.create(
      data,
      (req.files as Express.Multer.File[]) ?? [],
      memberId
    );

    return successResponse(
      res,
      "Post created successfully",
      PostResource.toResource(post)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updatePostSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Failed to update post", error);
    }

    const memberId = (req.user as Member).id;
    const post = await this.postService.update(
      +req.params.id,
      data,
      (req.files as Express.Multer.File[]) ?? [],
      memberId
    );

    return successResponse(
      res,
      "Post updated successfully",
      PostResource.toResource(post)
    );
  }

  async destroy(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    await this.postService.destroy(+req.params.id, memberId);
    return successResponse(res, "Post deleted successfully");
  }
}

export default PostController;
