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

    const socialPosts = await prisma.post.findMany({
      where: {
        // Social post only
        shopId: null,

        // If partner_id exists in filters, use it.
        ...(memberId !== undefined && {
          memberId,
        }),

        // caption ilike
        ...(caption && {
          caption: {
            contains: caption,
            mode: "insensitive",
          },
        }),

        // partner_id.name ilike
        ...(partnerName && {
          member: {
            profile: {
              name: {
                contains: partnerName,
                mode: "insensitive",
              },
            },
          },
        }),

        // partner_id.client_code =
        ...(clientCode && {
          member: {
            clientCode,
          },
        }),

        // post_category =
        ...(postCategory && {
          postCategory,
        }),
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
        postCategory: true,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          count: socialPosts.length,
          results: socialPosts.map((socialPost) => {
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
              is_save: false,
              saved_post_id: null,
              create_date: formatDate(socialPost.createdAt),
              media_line: socialPost.media,
              view_count: 29,
              react_count: 14,
              comment_count: 3,
              share_count: 1,
              is_react: false,
              is_reels: false,
              share_post_id: {
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
          is_save: false,
          saved_post_id: null,
          create_date: formatDate(socialPost.createdAt),
          media_line: socialPost.media,
          view_count: 0,
          react_count: 0,
          comment_count: 0,
          share_count: 0,
          is_react: false,
          is_reels: false,
          share_post_id: {
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
        id: data.share_post_id,
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
        id: data.share_post_id,
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
        sharePostId: data.share_post_id,
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
        sharePost: {
          include: {
            member: {
              include: {
                profile: true,
              },
            },
            postCategory: true,
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
          is_save: false,
          saved_post_id: null,
          create_date: formatDate(post.createdAt),
          media_line: post.media,
          view_count: 0,
          react_count: 0,
          comment_count: 0,
          share_count: 0,
          is_react: false,
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
            view_count: 0,
            react_count: 0,
            comment_count: 0,
            share_count: 2,
            is_react: false,
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
        memberId: member.id,
        shopId: null,
      },
    });

    if (!member) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "social post not found.",
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
    const updateSocialPost = await prisma.post.create({
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
          is_save: false,
          saved_post_id: null,
          create_date: formatDate(updateSocialPost.createdAt),
          media_line: updateSocialPost.media,
          view_count: 0,
          react_count: 0,
          comment_count: 0,
          share_count: 0,
          is_react: false,
          is_reels: false,
          share_post_id: {
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
