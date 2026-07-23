import { Request, Response } from "express";
import { Member, Prisma, PrivencyType } from "@prisma/client";
import { validater } from "../../../helpers/validator";
import {
  memberShopPostCreateSchema,
  memberShopPostUpdateSchema,
} from "../../../schemas/member/v1/member-shop-post.schema";
import prisma from "../../../../prisma/client";
import { formatDate } from "../../../helpers/helper";
import { upload } from "../../../helpers/media-upload";

class ShopPostController {
  async memberShopPosts(req: Request, res: Response) {
    // Filter
    const filters = req.body.params.filters;
    const offset = req.body.params.offset;
    const limit = req.body.params.limit;
    const order = req.body.params.order;
    const currentMemberId = (req.user as Member).id;

    const partnerIdMatch = filters.match(
      /\('partner_id'\s*,\s*'='\s*,\s*(\d+)\)/,
    );

    const partnerId = partnerIdMatch ? Number(partnerIdMatch[1]) : undefined;

    const createUidMatch = filters.match(
      /\('create_uid'\s*,\s*'='\s*,\s*(\d+)\)/,
    );

    const createUid = createUidMatch ? Number(createUidMatch[1]) : undefined;
    const memberId = partnerId ?? createUid;

    const captionMatch = filters.match(
      /\('caption'\s*,\s*'ilike'\s*,\s*'([^']*)'\)/,
    );

    const caption = captionMatch ? captionMatch[1] : undefined;

    // Pagination
    const skip = Math.max(0, Number(offset) || 0);
    const take = Math.max(1, Number(limit) || 20);
    const orderDirection =
      String(order || "create_date desc").split(" ")[1]?.toLowerCase() === "asc"
        ? "asc"
        : "desc";

    const where = {
      shopId: {
        not: null,
      },
      ...(memberId !== undefined && {
        memberId,
      }),
      ...(caption && {
        caption: {
          contains: caption,
          mode: "insensitive" as const,
        },
      }),
    };

    const [count, shopPosts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          shop: true,
          member: {
            include: {
              profile: true,
            },
          },
          shopViews: true,
          postReactions: true,
          postComments: true,
          sharedPosts: true,
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
          results: shopPosts.map((shopPost) => {
            const isReact = shopPost.postReactions.some(
              (reaction) => reaction.memberId === currentMemberId,
            );

            return {
              id: shopPost.id,
              caption: shopPost.caption,
              create_uid: shopPost.memberId,
              partner_id: {
                id: shopPost.member.id,
                image_1920: shopPost.member.profile?.coverPhoto ?? "",
                name: shopPost.member.name,
              },
              view_type:
                shopPost.privencyType === PrivencyType.PUBLIC
                  ? "public"
                  : shopPost.privencyType === PrivencyType.FRIEND
                    ? "friend"
                    : "only_me",
              create_date: formatDate(shopPost.createdAt),
              media_line: shopPost.media,
              view_count: shopPost.shopViews.length,
              react_count: shopPost.postReactions.length,
              comment_count: shopPost.postComments.length,
              share_count: shopPost.sharedPosts.length,
              is_react: isReact,
            };
          }),
        },
      },
    });
  }

  async memberShopPostCreate(req: Request, res: Response) {
    // Validation
    const { data, success, error } = await validater(
      memberShopPostCreateSchema,
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

    // Check Media
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Media is required.",
        },
      });
    }

    // Upload Media
    const imageFiles = (req.files as Express.Multer.File[]).filter(
      (file) => file.fieldname === "images",
    );

    const videoFiles = (req.files as Express.Multer.File[]).filter(
      (file) => file.fieldname === "videos",
    );

    const media: {
      image: string;
      video: string;
    }[] = [];

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

    // Check Current Shop
    const shop = await prisma.shop.findFirst({
      where: {
        memberId: member.id,
      },
      include: {
        shopLevel: true,
      },
    });

    if (!shop) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "You don't have a shop yet.",
        },
      });
    }

    // Check Shop Post Count
    const shopPostCount = await prisma.post.count({
      where: {
        shopId: shop.id,
        memberId: member.id,
      },
    });

    if (shopPostCount >= shop.shopLevel!.postLimit) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Access Denied.Need to Upgrade Shop Plan",
        },
      });
    }

    // Create Shop Post
    const privencyType =
      data.view_type === "public"
        ? PrivencyType.PUBLIC
        : data.view_type === "friend"
          ? PrivencyType.FRIEND
          : PrivencyType.ONLY_ME;

    const shopPost = await prisma.post.create({
      data: {
        caption: data.caption,
        privencyType: privencyType,
        price: data.price,
        media,
        currency: data.currency,
        timeAgo: new Date(),
        memberId: member.id,
        shopId: shop.id,
      },
      include: {
        shopViews: true,
        postReactions: true,
        postComments: true,
        sharedPosts: true,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        data: {
          id: shopPost.id,
          caption: shopPost.caption,
          partner_id: {
            id: member.id,
            image_1920: member.profile?.coverPhoto ?? "",
            name: member.name,
          },
          view_type:
            shopPost.privencyType === PrivencyType.PUBLIC
              ? "public"
              : shopPost.privencyType === PrivencyType.FRIEND
                ? "friend"
                : "only_me",
          create_date: formatDate(shopPost.createdAt),
          media_line: shopPost.media,
          view_count: shopPost.shopViews.length,
          react_count: shopPost.postReactions.length,
          comment_count: shopPost.postComments.length,
          share_count: shopPost.sharedPosts.length,
          is_react: shopPost.postReactions.some(
            (reaction) => reaction.memberId === member.id,
          ),
        },
      },
    });
  }

  async memberShopPostUpdate(req: Request, res: Response) {
    const { data, success, error } = await validater(
      memberShopPostUpdateSchema,
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

    // Check Current Shop Post
    const shopPost = await prisma.post.findFirst({
      where: {
        id: +req.params.id,
        memberId: member.id,
      },
    });

    if (!shopPost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Shop Post not found.",
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
        (file) => file.fieldname === "images",
      );

      const videoFiles = (req.files as Express.Multer.File[]).filter(
        (file) => file.fieldname === "videos",
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

    // Update Shop Post
    const privencyType =
      data.view_type === "public"
        ? PrivencyType.PUBLIC
        : data.view_type === "friend"
          ? PrivencyType.FRIEND
          : PrivencyType.ONLY_ME;

    const updateShopPost = await prisma.post.update({
      where: {
        id: +req.params.id,
        memberId: (req.user as Member).id,
      },
      data: {
        caption: data.caption ?? shopPost.caption,
        privencyType: privencyType ?? shopPost.privencyType,
        price: data.price ?? shopPost.price,
        media:
          media.length > 0 ? media : (shopPost.media as Prisma.InputJsonValue),
        currency: data.currency ?? shopPost.currency,
      },
      include: {
        shopViews: true,
        postReactions: true,
        postComments: true,
        sharedPosts: true,
      },
    });

    return res.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        isFullFilled: true,
        message: "Update Successfully.",
        data: {
          id: updateShopPost.id,
          caption: updateShopPost.caption,
          partner_id: {
            id: member.id,
            image_1920: member.profile?.coverPhoto ?? "",
            name: member.name,
          },
          view_type:
            updateShopPost.privencyType === PrivencyType.PUBLIC
              ? "public"
              : updateShopPost.privencyType === PrivencyType.FRIEND
                ? "friend"
                : "only_me",
          create_date: formatDate(updateShopPost.createdAt),
          media_line: updateShopPost.media,
          view_count: updateShopPost.shopViews.length,
          react_count: updateShopPost.postReactions.length,
          comment_count: updateShopPost.postComments.length,
          share_count: updateShopPost.sharedPosts.length,
          is_react: updateShopPost.postReactions.some(
            (reaction) => reaction.memberId === member.id,
          ),
        },
      },
    });
  }

  async memberShopPostDelete(req: Request, res: Response) {
    // Current Shop Post
    const shopPost = await prisma.post.findFirst({
      where: {
        id: +req.params.id,
        memberId: (req.user as Member).id,
      },
    });

    if (!shopPost) {
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: "Shop Post not found.",
        },
      });
    }

    // Delete Shop Post
    await prisma.post.delete({
      where: {
        id: +req.params.id,
        memberId: (req.user as Member).id,
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

export default ShopPostController;
