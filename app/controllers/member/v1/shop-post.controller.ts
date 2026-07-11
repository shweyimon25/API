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
import { formatDate } from "../../../helpers/helper";

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

        let images = [];
        let videos = [];
        let media = [];

        for (const file of req.files as Express.Multer.File[]) {
            if (file.fieldname === 'images') {
                const { fileUrl } = await upload(file);
                images.push(fileUrl);
            }
            if (file.fieldname === 'videos') {
                const { fileUrl } = await upload(file);
                videos.push(fileUrl);
            }
        }

        const maxLength = Math.max(images.length, videos.length);

        for (let i = 0; i < maxLength; i++) {
            media.push({
                image: images[i] ?? '',
                video: videos[i] ?? '',
            });
        }

        const shopPost = await prisma.post.create({
            data: {
                content: req.body.caption,
                privencyType: req.body.view_type == 'public' ? PrivencyType.PUBLIC : PrivencyType.PRIVATE,
                timeAgo: new Date(),
                viewCount: 0,
                media: media,
                shopId: req.body.shopId,
                memberId: memberId,
            }
        });

        return res.json({
            "jsonrpc": "2.0",
            "id": null,
            "result": {
                "isFullFilled": true,
                "data": {
                    "id": shopPost.id,
                    "caption": shopPost.content,
                    "partner_id": {
                        "image_1920": currentMember?.profile?.profilePhoto ?? '',
                        "name": currentMember?.name,
                        "id": currentMember?.profile?.id
                    },
                    "view_type": shopPost.privencyType == PrivencyType.PUBLIC ? 'public' : 'only_me',
                    "create_date": formatDate(shopPost.createdAt),
                    "media_line": shopPost.media,
                    "view_count": 0,
                    "react_count": 0,
                    "comment_count": 0,
                    "share_count": 0,
                    "is_react": null, // True or False
                    "price": 80000.0,
                    "currency": "ks",
                    "share_post_id": {
                        "view_count": 0,
                        "share_count": 0,
                        "create_date": null,
                        "caption": null,
                        "view_type": null,
                        "react_count": 0,
                        "comment_count": 0,
                        "is_react": false,
                        "id": null
                    }
                }
            }
        });
    }

    async memberShopPostUpdate(req: Request, res: Response) {
        const memberId = (req.user as Member).id;

        console.log(req.body);
    }
}

export default ShopPostController;
