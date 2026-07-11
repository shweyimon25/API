import { Request, Response } from "express";
import { Member, PrivencyType } from "@prisma/client";
import ShopPostService from "../../../services/member/v1/shop-post.service";
import prisma from "../../../../prisma/client";
import {
    buildMemberShopPostWhere,
    formatMemberShopPostWithShare,
    memberShopPostInclude,
    parseMemberShopPostOrder,
} from "../../../helpers/member-shop-post.helper";
import { upload } from "../../../helpers/media-upload";

class ShopPostController {
    private shopPostService: ShopPostService;

    constructor() {
        this.shopPostService = new ShopPostService();
    }

    async memberShopPosts(req: Request, res: Response) {
        const memberId = (req.user as Member).id;
        const params = req.body?.params ?? {};
        const offset = Number(params.offset ?? 0);
        const limit = Number(params.limit ?? 0);
        const where = buildMemberShopPostWhere(params.filters);
        const orderBy = parseMemberShopPostOrder(params.order);
        const include = memberShopPostInclude(memberId);

        const [count, posts] = await Promise.all([
            prisma.post.count({ where }),
            prisma.post.findMany({
                where,
                orderBy,
                ...(Number.isFinite(offset) && offset > 0 ? { skip: offset } : {}),
                ...(Number.isFinite(limit) && limit > 0 ? { take: limit } : {}),
                include,
            }),
        ]);

        const results = await Promise.all(
            posts.map((post) =>
                formatMemberShopPostWithShare(post, memberId)
            )
        );

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data: {
                    count,
                    results,
                },
            },
        });
    }

    async memberShopPostCreate(req: Request, res: Response) {
        const memberId = (req.user as Member).id;

        // Current Member
        const currentMember = await prisma.member.findUnique({
            where: {
                id: memberId,
            },
            include: {
                shop: true,
                profile: true,
            }
        });

        if (!currentMember?.shop) {
            return res.json({
                jsonrpc: "2.0",
                id: null,
                result: {
                    message: "Please create a shop first",
                    isFullFilled: false,
                    data: null,
                },
            });
        }

        let images: string[] = [];
        let videos: string[] = [];
        const media: { image: string | null; video: string | null }[] = [];
        const files = (req.files as Express.Multer.File[]) ?? [];

        for (const file of files) {
            const isImageField =
                file.fieldname === "images" ||
                file.fieldname === "media_line/image" ||
                file.fieldname === "media_line[image]" ||
                /^media_line\[\d+\]\[image\]$/.test(file.fieldname);

            const isVideoField =
                file.fieldname === "videos" ||
                file.fieldname === "media_line/video" ||
                file.fieldname === "media_line[video]" ||
                /^media_line\[\d+\]\[video\]$/.test(file.fieldname);

            if (isImageField && file.mimetype.startsWith("image/")) {
                const { fileUrl } = await upload(file, "shop-post");
                images.push(fileUrl);
            } else if (isVideoField && file.mimetype.startsWith("video/")) {
                const { fileUrl } = await upload(file, "shop-post");
                videos.push(fileUrl);
            }
        }

        const maxLength = Math.max(images.length, videos.length);

        for (let i = 0; i < maxLength; i++) {
            const image = images[i] ?? null;
            const video = videos[i] ?? null;
            if (image || video) {
                media.push({ image, video });
            }
        }

        const caption = String(req.body.caption ?? "").trim();
        const viewTypeRaw = String(req.body.view_type ?? "public").toLowerCase();
        const price = Number(req.body.price);
        const currency = String(req.body.currency ?? "ks").trim().toLowerCase() || "ks";

        const viewTypeMap: Record<string, PrivencyType> = {
            public: PrivencyType.PUBLIC,
            only_me: PrivencyType.PRIVATE,
            friend: PrivencyType.FRIEND,
        };
        const privencyType = viewTypeMap[viewTypeRaw] ?? PrivencyType.PUBLIC;

        const shopPost = await prisma.post.create({
            data: {
                content: {
                    caption: caption || null,
                    price: Number.isFinite(price) ? price : 0,
                    currency,
                },
                privencyType,
                media,
                shopId: currentMember.shop.id,
                memberId,
            },
            include: memberShopPostInclude(memberId),
        });

        const data = await formatMemberShopPostWithShare(shopPost, memberId);

        return res.json({
            jsonrpc: "2.0",
            id: null,
            result: {
                isFullFilled: true,
                data,
            },
        });
    }

    async memberShopPostUpdate(req: Request, res: Response) {
        const memberId = (req.user as Member).id;

        console.log(req.body);
    }
}

export default ShopPostController;
