import prisma from "../../../../prisma/client";
import { ForbiddenException, NotFoundException } from "../../../helpers/exceptions";
import { CreateShopPostInput, UpdateShopPostInput } from "../../../schemas/member/v1/shop-post.schema";

const shopPostInclude = {
    shop: {
        include: {
            member: {
                select: { id: true, name: true, email: true, code: true },
            },
        },
    },
};

class ShopPostService {
    async findAll() {
        const shopPosts = await prisma.shopPost.findMany({
            orderBy: { id: "desc" },
            include: shopPostInclude,
        });

        return shopPosts;
    }

    async findByPaginate(page: number, perPage: number) {
        const shopPosts = await prisma.shopPost.findMany({
            orderBy: { id: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
            include: shopPostInclude,
        });

        const totalShopPosts = await prisma.shopPost.count();

        return {
            data: shopPosts,
            meta: {
                totalCount: totalShopPosts,
                totalPages: Math.ceil(totalShopPosts / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalShopPosts / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalShopPosts / perPage),
            },
        };
    }

    async findOne(id: number) {
        const shopPost = await prisma.shopPost.findUnique({
            where: { id },
            include: shopPostInclude,
        });

        if (!shopPost) {
            throw new NotFoundException("Shop post not found");
        }

        return shopPost;
    }

    async create(createShopPostInput: CreateShopPostInput, memberId: number) {
        const { caption, images, shopId } = createShopPostInput;

        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            throw new NotFoundException("Shop not found");
        }
        if (shop.memberId !== memberId) {
            throw new ForbiddenException("You can only create posts for your own shop");
        }

        const shopPost = await prisma.shopPost.create({
            data: { caption, images, shopId },
        });

        return this.findOne(shopPost.id);
    }

    async update(id: number, updateShopPostInput: UpdateShopPostInput, memberId: number) {
        const existing = await prisma.shopPost.findUnique({
            where: { id },
            include: { shop: true },
        });

        if (!existing) {
            throw new NotFoundException("Shop post not found");
        }
        if (existing.shop.memberId !== memberId) {
            throw new ForbiddenException("You can only update your own shop posts");
        }

        const { caption } = updateShopPostInput;
        await prisma.shopPost.update({
            where: { id },
            data: { caption: caption ?? existing.caption },
        });

        return this.findOne(id);
    }

    async destroy(id: number, memberId: number) {
        const existing = await prisma.shopPost.findUnique({
            where: { id },
            include: { shop: true },
        });

        if (!existing) {
            throw new NotFoundException("Shop post not found");
        }
        if (existing.shop.memberId !== memberId) {
            throw new ForbiddenException("You can only delete your own shop posts");
        }

        await prisma.shopPost.delete({
            where: { id },
        });
    }
}

export default ShopPostService;