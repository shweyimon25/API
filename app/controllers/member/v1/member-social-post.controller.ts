import { Request, Response } from "express";
import prisma from "../../../../prisma/client";
import { validater } from "../../../helpers/validator";
import {
  memberPostSaveCreateSchema,
  memberSocialPostCreateSchema,
  memberSocialPostUpdateSchema,
  memberSocialSharePostCreateSchema,
} from "../../../schemas/member/v1/member-social-post.schema";
import { Member, Prisma, PrivencyType } from "@prisma/client";
import { upload } from "../../../helpers/media-upload";
import { formatDate } from "../../../helpers/helper";

class MemberSocialPostController {
  async memberSocialPosts(req: Request, res: Response) {
    const filters = req.body.params.filters;
    const offset = req.body.params.offset;
    const limit = req.body.params.limit;
    const order = req.body.params.order;
    const currentMemberId = (req.user as Member).id;

    const partnerIdMatch = filters.match(
      /\('partner_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );

    const memberId = partnerIdMatch ? Number(partnerIdMatch[1]) : undefined;

    const captionMatch = filters.match(
      /\('caption'\s*,\s*'ilike'\s*,\s*'([^']*)'\)/,
    );

    const caption = captionMatch ? captionMatch[1] : undefined;

    const partnerNameMatch = filters.match(
      /\('partner_id\.name'\s*,\s*'ilike'\s*,\s*'([^']*)'\)/,
    );

    const partnerName = partnerNameMatch ? partnerNameMatch[1] : undefined;

    const clientCodeMatch = filters.match(
      /\('partner_id\.client_code'\s*,\s*'='\s*,\s*'([^']*)'\)/,
    );

    const clientCode = clientCodeMatch ? clientCodeMatch[1] : undefined;

    const postCategoryMatch = filters.match(
      /\('post_category'\s*,\s*'='\s*,\s*'([^']*)'\)/,
    );

    const postCategory = postCategoryMatch ? postCategoryMatch[1] : undefined;

    // Pagination
    const skip = Math.max(0, Number(offset) || 0);
    const take = Math.max(1, Number(limit) || 20);
    const orderDirection =
      String(order || "create_date desc").split(" ")[1]?.toLowerCase() === "asc"
        ? "asc"
        : "desc";

    const where = {
      shopId: null,
      ...(memberId !== undefined && {
        memberId,
      }),
      ...(caption && {
        caption: {
          contains: caption,
          mode: "insensitive" as const,
        },
      }),
      ...(partnerName && {
        member: {
          profile: {
            name: {
              contains: partnerName,
              mode: "insensitive" as const,
            },
          },
        },
      }),
      ...(clientCode && {
        member: {
          clientCode,
        },
      }),
      ...(postCategory && {
        postCategory: {
          name: postCategory,
        },
      }),
    };

    const [count, socialPosts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          member: {
            include: {
              profile: true,
            },
          },
          postCategory: true,
          socialViews: true,
          postReactions: true,
          postComments: true,
          sharedPosts: true,
          socialSaves: {
            where: {
              memberId: currentMemberId,
            },
          },
          sharePost: {
            include: {
              member: {
                include: {
                  profile: true,
                },
              },
              postCategory: true,
              socialViews: true,
              postReactions: true,
              postComments: true,
              sharedPosts: true,
            },
          },
        },
        orderBy: {
          createdAt: orderDirection,
        },
        skip,
        take,
      }),
    ]);

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count: count,
          results: socialPosts.map((socialPost) => {
            const savedPost = socialPost.socialSaves[0];
            const isReact = socialPost.postReactions.some(
              (reaction) => reaction.memberId === currentMemberId,
            );

            return {
              id: socialPost.id,
              caption: socialPost.caption,
              create_uid: socialPost.memberId,
              partner_id: {
                id: socialPost.memberId,
                name: socialPost.member.name,
                image_1920: socialPost.member.profile?.coverPhoto ?? "",
              },
              view_type:
                socialPost.privencyType === PrivencyType.PUBLIC
                  ? "public"
                  : socialPost.privencyType === PrivencyType.FRIEND
                    ? "friend"
                    : "only_me",
              post_category: socialPost.postCategory?.name,
              is_save: !!savedPost,
              saved_post_id: savedPost?.id ?? null,
              create_date: formatDate(socialPost.createdAt),
              media_line: socialPost.media,
              view_count: socialPost.socialViews.length,
              react_count: socialPost.postReactions.length,
              comment_count: socialPost.postComments.length,
              share_count: socialPost.sharedPosts.length,
              is_react: isReact,
              is_reels: false,
              share_post_id: socialPost.sharePost
                ? {
                    id: socialPost.sharePost.id,
                    caption: socialPost.sharePost.caption,
                    create_uid: socialPost.sharePost.memberId,
                    partner_id: {
                      id: socialPost.sharePost.memberId,
                      name: socialPost.sharePost.member.name,
                      image_1920:
                        socialPost.sharePost.member.profile?.coverPhoto ?? "",
                    },
                    view_type:
                      socialPost.sharePost.privencyType === PrivencyType.PUBLIC
                        ? "public"
                        : socialPost.sharePost.privencyType ===
                            PrivencyType.FRIEND
                          ? "friend"
                          : "only_me",
                    post_category: socialPost.sharePost.postCategory?.name,
                    create_date: formatDate(socialPost.sharePost.createdAt),
                    media_line: socialPost.sharePost.media,
                    view_count: socialPost.sharePost.socialViews.length,
                    react_count: socialPost.sharePost.postReactions.length,
                    comment_count: socialPost.sharePost.postComments.length,
                    share_count: socialPost.sharePost.sharedPosts.length,
                    is_react: socialPost.sharePost.postReactions.some(
                      (reaction) => reaction.memberId === currentMemberId,
                    ),
                    is_reels: false,
                  }
                : {
                    id: null,
                    caption: null,
                    create_uid: null,
                    partner_id: {
                      id: null,
                      name: null,
                      image_1920:
                        "http://localhost:8069/web/image/?model=res.partner&id=False&field=image_1920",
                    },
                  },
            };
          }),
        },
      },
    });
  }

  async memberSocialPostCreate(req: Request, res: Response) {
    const { data, error, success } = await validater(
      memberSocialPostCreateSchema,
      req.body,
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

    // Current Member
    const member = await prisma.member.findUnique({
      where: {
        id: (req.user as Member).id,
      },
      include: {
        profile: true,
      },
    });

    if (!member) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Member not found.",
        },
      });
    }

    // Upload Media
    const media: {
      image: string;
      video: string;
    }[] = [];

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const imageFiles = (req.files as Express.Multer.File[]).filter(
        (file) => file.fieldname === "media_line/image",
      );

      const videoFiles = (req.files as Express.Multer.File[]).filter(
        (file) => file.fieldname === "media_line/video",
      );

      const maxLength = Math.max(imageFiles.length, videoFiles.length);

      for (let i = 0; i < maxLength; i++) {
        let image = "";
        let video = "";

        if (imageFiles[i]) {
          const { fileUrl } = await upload(imageFiles[i]);
          image = fileUrl;
        }

        if (videoFiles[i]) {
          const { fileUrl } = await upload(videoFiles[i]);
          video = fileUrl;
        }

        media.push({
          image,
          video,
        });
      }
    }

    // Find Post Category
    const postCategory = await prisma.postCategory.findFirst({
      where: {
        name: data.post_category,
      },
    });

    if (!postCategory) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Post category not found",
        },
      });
    }

    // Privency Type Generate Name
    const privencyType =
      data.view_type === "public"
        ? PrivencyType.PUBLIC
        : data.view_type === "friend"
          ? PrivencyType.FRIEND
          : PrivencyType.ONLY_ME;

    // Create Social Post
    const socialPost = await prisma.post.create({
      data: {
        caption: data.caption,
        privencyType: privencyType,
        postCategoryId: postCategory.id,
        memberId: member.id,
        media: media,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        postCategory: true,
        socialViews: true,
        postReactions: true,
        postComments: true,
        sharedPosts: true,
        socialSaves: {
          where: {
            memberId: member.id,
          },
        },
        sharePost: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCategory: true,
            socialViews: true,
            postReactions: true,
            postComments: true,
            sharedPosts: true,
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
          id: socialPost.id,
          caption: socialPost.caption,
          create_uid: socialPost.memberId,
          partner_id: {
            id: socialPost.member.id,
            name: socialPost.member.name,
            image_1920: socialPost.member.profile?.coverPhoto ?? "",
          },
          view_type:
            socialPost.privencyType === PrivencyType.PUBLIC
              ? "public"
              : socialPost.privencyType === PrivencyType.FRIEND
                ? "friend"
                : "only_me",
          post_category: socialPost.postCategory?.name,
          is_save: !!socialPost.socialSaves[0],
          saved_post_id: socialPost.socialSaves[0]?.id ?? null,
          create_date: formatDate(socialPost.createdAt),
          media_line: socialPost.media,
          view_count: socialPost?.socialViews?.length ?? 0,
          react_count: socialPost?.postReactions?.length ?? 0,
          comment_count: socialPost?.postComments?.length ?? 0,
          share_count: socialPost?.sharedPosts?.length ?? 0,
          is_react: socialPost.postReactions.some(
            (reaction) => reaction.memberId === member.id,
          ),
          is_reels: false,
          share_post_id: socialPost.sharePost
            ? {
                id: socialPost.sharePost.id,
                caption: socialPost.sharePost.caption,
                create_uid: socialPost.sharePost.memberId,
                partner_id: {
                  id: socialPost.sharePost.memberId,
                  name: socialPost.sharePost.member.name,
                  image_1920:
                    socialPost.sharePost.member.profile?.coverPhoto ?? "",
                },
                view_type:
                  socialPost.sharePost.privencyType === PrivencyType.PUBLIC
                    ? "public"
                    : socialPost.sharePost.privencyType === PrivencyType.FRIEND
                      ? "friend"
                      : "only_me",
                post_category: socialPost.sharePost.postCategory?.name,
                create_date: formatDate(socialPost.sharePost.createdAt),
                media_line: socialPost.sharePost.media,
                view_count: socialPost.sharePost.socialViews.length,
                react_count: socialPost.sharePost.postReactions.length,
                comment_count: socialPost.sharePost.postComments.length,
                share_count: socialPost.sharePost.sharedPosts.length,
                is_react: socialPost.sharePost.postReactions.some(
                  (reaction) => reaction.memberId === member.id,
                ),
                is_reels: false,
              }
            : {
                id: null,
                caption: null,
                create_uid: null,
                partner_id: {
                  id: null,
                  name: null,
                  image_1920:
                    "http://localhost:8069/web/image/?model=res.partner&id=False&field=image_1920",
                },
              },
        },
      },
    });
  }

  async memberSocialSharePostCreate(req: Request, res: Response) {
    const { data, success, error } = await validater(
      memberSocialSharePostCreateSchema,
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

    // Check Share Post Id
    const existingSharePost = await prisma.post.findFirst({
      where: {
        id: +data.share_post_id,
        shop: null,
        memberId: (req.user as Member).id,
      },
    });

    if (!existingSharePost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Shre post not found",
        },
      });
    }

    // Check Post Category
    const existingPostCategory = await prisma.postCategory.findFirst({
      where: {
        name: data.post_category,
      },
    });

    if (!existingPostCategory) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Post category not found",
        },
      });
    }

    // Privency Type Generate Name
    const privencyType =
      data.view_type === "public"
        ? PrivencyType.PUBLIC
        : data.view_type === "friend"
          ? PrivencyType.FRIEND
          : PrivencyType.ONLY_ME;

    // Create Share Post
    const post = await prisma.post.create({
      data: {
        caption: data.caption,
        postCategoryId: existingPostCategory.id,
        privencyType,
        sharePostId: +data.share_post_id,
        memberId: (req.user as Member).id,
        media: existingSharePost.media as Prisma.InputJsonValue,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        postCategory: true,
        socialViews: true,
        postReactions: true,
        postComments: true,
        sharedPosts: true,
        socialSaves: {
          where: {
            memberId: (req.user as Member).id,
          },
        },
        sharePost: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCategory: true,
            socialViews: true,
            postReactions: true,
            postComments: true,
            sharedPosts: true,
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
          id: post.id,
          caption: post.caption,
          create_uid: post.id,
          partner_id: {
            id: post.member.id,
            name: post.member.name,
            image_1920: post.member.profile?.coverPhoto ?? "",
          },
          view_type:
            post.privencyType === PrivencyType.PUBLIC
              ? "public"
              : post.privencyType === PrivencyType.FRIEND
                ? "friend"
                : "only_me",
          post_category: post.postCategory?.name,
          is_save: !!post.socialSaves[0],
          saved_post_id: post.socialSaves[0]?.id ?? null,
          create_date: formatDate(post.createdAt),
          media_line: post.media,
          view_count: post?.socialViews?.length ?? 0,
          react_count: post?.postReactions?.length ?? 0,
          comment_count: post?.postComments?.length ?? 0,
          share_count: post?.sharedPosts?.length ?? 0,
          is_react: post.postReactions.some(
            (reaction) => reaction.memberId === (req.user as Member).id,
          ),
          is_reels: false,
          share_post_id: {
            id: post.sharePost?.id,
            caption: post.sharePost?.caption,
            create_uid: post.sharePost?.id,
            partner_id: {
              id: post.sharePost?.memberId,
              name: post.sharePost?.member.name,
              image_1920: post.sharePost?.member.profile?.coverPhoto ?? "",
            },
            view_type:
              post.sharePost?.privencyType === PrivencyType.PUBLIC
                ? "public"
                : post.privencyType === PrivencyType.FRIEND
                  ? "friend"
                  : "only_me",
            post_category: post.sharePost?.postCategory?.name,
            create_date: formatDate(post.sharePost?.createdAt ?? new Date()),
            media_line: post.sharePost?.media,
            view_count: post.sharePost?.socialViews?.length ?? 0,
            react_count: post.sharePost?.postReactions?.length ?? 0,
            comment_count: post.sharePost?.postComments?.length ?? 0,
            share_count: post.sharePost?.sharedPosts?.length ?? 0,
            is_react:
              post.sharePost?.postReactions.some(
                (reaction) => reaction.memberId === (req.user as Member).id,
              ) ?? false,
            is_reels: false,
          },
        },
      },
    });
  }

  async memberSocialPostUpdate(req: Request, res: Response) {
    const { data, success, error } = await validater(
      memberSocialPostUpdateSchema,
      req.body,
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

    // Current Member
    const member = await prisma.member.findUnique({
      where: {
        id: (req.user as Member).id,
      },
      include: {
        profile: true,
      },
    });

    if (!member) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Member not found.",
        },
      });
    }

    // Check Current Social Post
    const socialPost = await prisma.post.findFirst({
      where: {
        id: +req.params.id,
        memberId: member.id,
        shopId: null,
      },
    });

    if (!socialPost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Social post not found.",
        },
      });
    }

    // Upload Media
    const media: {
      image: string;
      video: string;
    }[] = [];

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const imageFiles = (req.files as Express.Multer.File[]).filter(
        (file) => file.fieldname === "media_line/image",
      );

      const videoFiles = (req.files as Express.Multer.File[]).filter(
        (file) => file.fieldname === "media_line/video",
      );

      const maxLength = Math.max(imageFiles.length, videoFiles.length);

      for (let i = 0; i < maxLength; i++) {
        let image = "";
        let video = "";

        if (imageFiles[i]) {
          const { fileUrl } = await upload(imageFiles[i]);
          image = fileUrl;
        }

        if (videoFiles[i]) {
          const { fileUrl } = await upload(videoFiles[i]);
          video = fileUrl;
        }

        media.push({
          image,
          video,
        });
      }
    }

    // Find Post Category
    const postCategory = await prisma.postCategory.findFirst({
      where: {
        name: data.post_category,
      },
    });

    if (!postCategory) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Post category not found",
        },
      });
    }

    // Privency Type Generate Name
    const privencyType =
      data.view_type === "public"
        ? PrivencyType.PUBLIC
        : data.view_type === "friend"
          ? PrivencyType.FRIEND
          : PrivencyType.ONLY_ME;

    // Create Social Post
    const updateSocialPost = await prisma.post.update({
      where: {
        id: +req.params.id,
      },
      data: {
        caption: data.caption ?? socialPost?.caption,
        privencyType: privencyType ?? socialPost?.privencyType,
        postCategoryId: postCategory.id ?? socialPost?.postCategoryId,
        memberId: member.id,
        media:
          media.length > 0
            ? media
            : (socialPost?.media as Prisma.InputJsonValue),
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        postCategory: true,
        socialViews: true,
        postReactions: true,
        postComments: true,
        sharedPosts: true,
        socialSaves: {
          where: {
            memberId: member.id,
          },
        },
        sharePost: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCategory: true,
            socialViews: true,
            postReactions: true,
            postComments: true,
            sharedPosts: true,
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
          id: updateSocialPost.id,
          caption: updateSocialPost.caption,
          create_uid: updateSocialPost.memberId,
          partner_id: {
            id: updateSocialPost.member.id,
            name: updateSocialPost.member.name,
            image_1920: updateSocialPost.member.profile?.coverPhoto ?? "",
          },
          view_type:
            updateSocialPost.privencyType === PrivencyType.PUBLIC
              ? "public"
              : updateSocialPost.privencyType === PrivencyType.FRIEND
                ? "friend"
                : "only_me",
          post_category: updateSocialPost.postCategory?.name,
          is_save: !!updateSocialPost.socialSaves[0],
          saved_post_id: updateSocialPost.socialSaves[0]?.id ?? null,
          create_date: formatDate(updateSocialPost.createdAt),
          media_line: updateSocialPost.media,
          view_count: updateSocialPost?.socialViews?.length ?? 0,
          react_count: updateSocialPost?.postReactions?.length ?? 0,
          comment_count: updateSocialPost?.postComments?.length ?? 0,
          share_count: updateSocialPost?.sharedPosts?.length ?? 0,
          is_react: updateSocialPost.postReactions.some(
            (reaction) => reaction.memberId === member.id,
          ),
          is_reels: false,
          share_post_id: updateSocialPost.sharePost
            ? {
                id: updateSocialPost.sharePost.id,
                caption: updateSocialPost.sharePost.caption,
                create_uid: updateSocialPost.sharePost.memberId,
                partner_id: {
                  id: updateSocialPost.sharePost.memberId,
                  name: updateSocialPost.sharePost.member.name,
                  image_1920:
                    updateSocialPost.sharePost.member.profile?.coverPhoto ?? "",
                },
                view_type:
                  updateSocialPost.sharePost.privencyType === PrivencyType.PUBLIC
                    ? "public"
                    : updateSocialPost.sharePost.privencyType ===
                        PrivencyType.FRIEND
                      ? "friend"
                      : "only_me",
                post_category: updateSocialPost.sharePost.postCategory?.name,
                create_date: formatDate(updateSocialPost.sharePost.createdAt),
                media_line: updateSocialPost.sharePost.media,
                view_count: updateSocialPost.sharePost.socialViews.length,
                react_count: updateSocialPost.sharePost.postReactions.length,
                comment_count: updateSocialPost.sharePost.postComments.length,
                share_count: updateSocialPost.sharePost.sharedPosts.length,
                is_react: updateSocialPost.sharePost.postReactions.some(
                  (reaction) => reaction.memberId === member.id,
                ),
                is_reels: false,
              }
            : {
                id: null,
                caption: null,
                create_uid: null,
                partner_id: {
                  id: null,
                  name: null,
                  image_1920:
                    "http://localhost:8069/web/image/?model=res.partner&id=False&field=image_1920",
                },
              },
        },
      },
    });
  }

  async memberSocialPostDelete(req: Request, res: Response) {
    const socialPost = await prisma.post.findFirst({
      where: {
        id: +req.params.id,
        memberId: +(req.user as Member).id,
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

    await prisma.post.delete({
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

  async memberPostSaveCreate(req: Request, res: Response) {
    const { data, error, success } = await validater(
      memberPostSaveCreateSchema,
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

    // Check Social Post
    const existingSocialPost = await prisma.post.findFirst({
      where: {
        id: +data.social_post_id,
        memberId: +(req.user as Member).id,
        shopId: null,
      },
    });

    if (!existingSocialPost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Social post not found",
        },
      });
    }

    // Create Save Post
    const savePost = await prisma.postSave.create({
      data: {
        memberId: +(req.user as Member).id,
        socialPostId: +data.social_post_id,
      },
      include: {
        socialPost: {
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
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: savePost.id,
          create_uid: {
            id: savePost.memberId,
            name: savePost.member.name,
            image_1920: savePost.member.profile?.coverPhoto ?? "",
          },
          social_post_id: {
            id: savePost.socialPostId,
            caption: savePost.socialPost?.caption,
          },
          caption: savePost.socialPost?.caption,
          create_user: {
            id: savePost.socialPost?.memberId,
            name: savePost.socialPost?.member.name,
            image_1920: savePost.socialPost?.member.profile?.coverPhoto ?? "",
          },
          post_media_url: "",
        },
      },
    });
  }

  async memberPostSaveDelete(req: Request, res: Response) {
    // Check Save Post
    const existingSavePost = await prisma.postSave.findFirst({
      where: {
        id: +req.params.id,
        memberId: +(req.user as Member).id,
      },
    });

    if (!existingSavePost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Save post not found",
        },
      });
    }

    await prisma.postSave.delete({
      where: {
        id: existingSavePost.id,
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

export default MemberSocialPostController;
