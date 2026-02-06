import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { ForbiddenException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { CreateShopPostInput, UpdateShopPostInput } from "../../../schemas/member/v1/shop-post.schema";
import { upload } from "../../../helpers/media-upload";

const shopPostInclude = {
    shop: {
        include: {
            member: {
                select: { id: true, name: true, email: true, code: true },
            },
        },
    },
};

/** Member API: only posts from ACTIVE shops */
const memberShopPostWhere = (where?: Prisma.ShopPostWhereInput): Prisma.ShopPostWhereInput => ({
    ...where,
    shop: { status: Status.ACTIVE },
});

class ShopPostService {
    async findAll(where?: Prisma.ShopPostWhereInput) {
        const shopPosts = await prisma.shopPost.findMany({
            where: memberShopPostWhere(where),
            orderBy: { id: "desc" },
            include: shopPostInclude,
        });

        return shopPosts;
    }

    async findByPaginate(page: number, perPage: number, where?: Prisma.ShopPostWhereInput) {
        const shopPosts = await prisma.shopPost.findMany({
            where: memberShopPostWhere(where),
            orderBy: { id: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
            include: shopPostInclude,
        });

        const totalShopPosts = await prisma.shopPost.count({
            where: memberShopPostWhere(where),
        });

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

        const updated = await prisma.shopPost.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
            include: shopPostInclude,
        });
        return updated;
    }

    async create(createShopPostInput: CreateShopPostInput, files: Express.Multer.File[], memberId: number) {
        const { caption, shopId } = createShopPostInput;

        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            throw new NotFoundException("Shop not found");
        }

        if (shop.memberId !== memberId) {
            throw new ForbiddenException("You can only create posts for your own shop");
        }

        const imageFiles = (files ?? []).filter(
            (f: Express.Multer.File) => f.fieldname === "images"
        );

        if (imageFiles.length === 0) {
            throw new ValidationException("Failed to create post", [
                { field: "images", issue: "Images files are required" },
            ]);
        }

        const imageUrls = await Promise.all(
            imageFiles.map(async (file: Express.Multer.File) => {
                const { fileUrl } = await upload(file, "shop-post");
                return fileUrl;
            })
        );

        const shopPost = await prisma.shopPost.create({
            data: { caption, images: imageUrls, shopId },
        });

        return this.findOne(shopPost.id);
    }

    async update(id: number, updateShopPostInput: UpdateShopPostInput, files: Express.Multer.File[], memberId: number) {
        const { caption } = updateShopPostInput;

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

        const imageFiles = (files ?? []).filter(
            (f: Express.Multer.File) => f.fieldname === "images"
        );

        if (imageFiles.length === 0) {
            throw new ValidationException("Failed to update shop post", [
                { field: "images", issue: "Images files are required" },
            ]);
        }

        const imageUrls = await Promise.all(
            imageFiles.map(async (file: Express.Multer.File) => {
                const { fileUrl } = await upload(file, "shop-post");
                return fileUrl;
            })
        );

        await prisma.shopPost.update({
            where: { id },
            data: { caption: caption ?? existing.caption, images: imageUrls },
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