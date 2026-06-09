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

  private sharePostId(content: unknown) {
    if (typeof content !== "object" || content === null) return null;
    const raw = (content as Record<string, unknown>).share_post_id;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  private viewType(t: string | null | undefined) {
    if (t === "PRIVATE") return "only_me";
    if (t === "FRIEND") return "friend";
    return "public";
  }

  private mediaLine(media: unknown) {
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
  }

  private firstMediaUrl(media: unknown) {
    const first = this.mediaLine(media)[0];
    return first?.image ?? first?.video ?? null;
  }

  private formatSharedPost(
    post: {
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
    },
    shareCount = 0
  ) {
    return {
      id: post.id,
      caption: this.caption(post.content),
      create_uid: post.memberId,
      partner_id: {
        id: post.member?.id ?? null,
        name: post.member?.name ?? null,
        image_1920: post.member?.profile?.profilePhoto ?? "",
      },
      view_type: this.viewType(post.privencyType),
      post_category: post.tag?.name?.toLowerCase() ?? "home",
      create_date: this.formatDate(post.createdAt),
      media_line: this.mediaLine(post.media),
      view_count: post.viewCount ?? 0,
      react_count: post._count.postReactions,
      comment_count: post._count.postComments,
      share_count: shareCount,
      is_react: post.postReactions.length > 0 ? true : null,
      is_reels: null,
    };
  }

  private formatSocialPost(
    post: {
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
    },
    sharePost?: ReturnType<PostController["formatSharedPost"]> | null,
    shareCount = 0,
    savedPostId: number | null = null
  ) {
    return {
      id: post.id,
      caption: this.caption(post.content),
      create_uid: post.memberId,
      partner_id: {
        id: post.member?.id ?? null,
        name: post.member?.name ?? null,
        image_1920: post.member?.profile?.profilePhoto ?? "",
      },
      view_type: this.viewType(post.privencyType),
      post_category: post.tag?.name?.toLowerCase() ?? "home",
      is_save: savedPostId ? true : false,
      saved_post_id: savedPostId ? String(savedPostId) : "",
      create_date: this.formatDate(post.createdAt),
      media_line: this.mediaLine(post.media),
      view_count: post.viewCount ?? 0,
      react_count: post._count.postReactions,
      comment_count: post._count.postComments,
      share_count: shareCount,
      is_react: post.postReactions.length > 0 ? true : null,
      is_reels: null,
      share_post_id: sharePost ?? this.emptySharePost(),
    };
  }

  private async formatSocialPostWithShare(
    post: Parameters<PostController["formatSocialPost"]>[0],
    memberId: number
  ) {
    const sharePostId = this.sharePostId(post.content);
    const [shareCount, savedPost, sharedPost] = await Promise.all([
      prisma.post.count({
        where: { content: { path: ["share_post_id"], equals: post.id } },
      }),
      prisma.postSave.findFirst({
        where: { memberId, socialPostId: post.id },
        select: { id: true },
      }),
      sharePostId
        ? prisma.post.findFirst({
            where: { id: sharePostId, shopId: null },
            include: this.socialPostInclude(memberId),
          })
        : Promise.resolve(null),
    ]);

    if (!sharedPost) {
      return this.formatSocialPost(
        post,
        null,
        shareCount,
        savedPost?.id ?? null
      );
    }

    const sharedPostShareCount = await prisma.post.count({
      where: { content: { path: ["share_post_id"], equals: sharedPost.id } },
    });

    return this.formatSocialPost(
      post,
      this.formatSharedPost(sharedPost, sharedPostShareCount),
      shareCount,
      savedPost?.id ?? null
    );
  }

  private formatSavedPost(save: {
    id: number;
    member: {
      id: number;
      name: string;
      profile: { profilePhoto: string | null } | null;
    };
    socialPost: { id: number; content: unknown; media: unknown } | null;
    shopPost: { id: number; content: unknown; media: unknown } | null;
  }) {
    const post = save.socialPost ?? save.shopPost;

    return {
      id: save.id,
      create_uid: {
        id: save.member.id,
        name: save.member.name,
        image_1920: save.member.profile?.profilePhoto ?? "",
      },
      social_post_id: {
        id: save.socialPost?.id ?? null,
        caption: save.socialPost ? this.caption(save.socialPost.content) : null,
      },
      shop_post_id: {
        id: save.shopPost?.id ?? null,
        caption: save.shopPost ? this.caption(save.shopPost.content) : null,
      },
      caption: post ? this.caption(post.content) : null,
      create_user: null,
      post_media_url: post ? this.firstMediaUrl(post.media) : null,
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

    const results = await Promise.all(
      posts.map((post) => this.formatSocialPostWithShare(post, memberId))
    );

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

    // const updated = await prisma.post.update({
    //   where: { id: postId },
    //   data: { viewCount: { increment: 1 } },
    //   include: this.socialPostInclude(memberId),
    // });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: await this.formatSocialPostWithShare(post, memberId),
      },
    });
  }

  async memberPostSaveCreate(req: Request, res: Response) {
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

    const save = socialPostId
      ? await prisma.postSave.upsert({
          where: {
            memberId_socialPostId: { memberId, socialPostId },
          },
          create: { memberId, socialPostId },
          update: {},
          include,
        })
      : await prisma.postSave.upsert({
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
        data: this.formatSavedPost(save),
      },
    });
  }

  async memberPostSaveDelete(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const saveId = +req.params.id;

    if (!saveId) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Saved post not found",
          data: null,
        },
      });
    }

    const save = await prisma.postSave.findFirst({
      where: { id: saveId, memberId },
    });

    if (!save) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Saved post not found",
          data: null,
        },
      });
    }

    await prisma.postSave.delete({ where: { id: saveId } });

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

  async memberSocialPostCreate(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    const body = req.body?.params ?? req.body ?? {};
    const caption = String(body.caption ?? "").trim();
    const viewTypeRaw = String(body.view_type ?? "public").toLowerCase();
    const postCategory = String(body.post_category ?? "home").toLowerCase();
    const sharePostId = Number(body.share_post_id) || null;

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

    if (!caption && !imageFile && !videoFile && !sharePostId) {
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

    if (sharePostId) {
      const sharePost = await prisma.post.findFirst({
        where: { id: sharePostId, shopId: null },
      });

      if (!sharePost) {
        return res.json({
          jsonrpc: "2.0",
          id: null,
          result: {
            isFullFilled: false,
            message: "Share post not found",
            data: null,
          },
        });
      }
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
        content: (sharePostId
          ? { caption: caption || null, share_post_id: sharePostId }
          : caption) as Prisma.InputJsonValue,
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
        data: await this.formatSocialPostWithShare(created, memberId),
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
        data: await this.formatSocialPostWithShare(updated, memberId),
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
