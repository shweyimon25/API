import { Prisma, PrivencyType, Status } from "@prisma/client";
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
} satisfies Prisma.PostInclude;

const shopPostBaseWhere: Prisma.PostWhereInput = {
    shopId: { not: null },
    shop: { status: Status.ACTIVE },
};

const memberShopPostWhere = (where?: Prisma.PostWhereInput): Prisma.PostWhereInput => ({
    AND: [shopPostBaseWhere, ...(where && Object.keys(where).length ? [where] : [])],
});

class ShopPostService {
    async findAll(where?: Prisma.PostWhereInput) {
        return prisma.post.findMany({
            where: memberShopPostWhere(where),
            orderBy: { id: "desc" },
            include: shopPostInclude,
        });
    }

    async findByPaginate(page: number, perPage: number, where?: Prisma.PostWhereInput) {
        const shopPosts = await prisma.post.findMany({
            where: memberShopPostWhere(where),
            orderBy: { id: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
            include: shopPostInclude,
        });

        const totalShopPosts = await prisma.post.count({
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
        const post = await prisma.post.findFirst({
            where: { id, ...shopPostBaseWhere },
            include: shopPostInclude,
        });

        if (!post) {
            throw new NotFoundException("Shop post not found");
        }

        return prisma.post.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
            include: shopPostInclude,
        });
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

        if (shop.memberId == null) {
            throw new ValidationException("Failed to create post", [
                { field: "shopId", issue: "Shop has no owner member" },
            ]);
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

        const created = await prisma.post.create({
            data: {
                content: { caption } as object,
                media: imageUrls as object,
                shopId,
                memberId: shop.memberId,
                privencyType: PrivencyType.PUBLIC,
            },
        });

        return this.findOne(created.id);
    }

    async update(id: number, updateShopPostInput: UpdateShopPostInput, files: Express.Multer.File[], memberId: number) {
        const { caption } = updateShopPostInput;

        const existing = await prisma.post.findFirst({
            where: { id, ...shopPostBaseWhere },
            include: { shop: true },
        });

        if (!existing) {
            throw new NotFoundException("Shop post not found");
        }

        if (existing.shop?.memberId !== memberId) {
            throw new ForbiddenException("You can only update your own shop posts");
        }

        const imageFiles = (files ?? []).filter(
            (f: Express.Multer.File) => f.fieldname === "images"
        );

        const prevContent =
            existing.content && typeof existing.content === "object" && !Array.isArray(existing.content)
                ? (existing.content as Record<string, unknown>)
                : {};
        const nextCaption = caption ?? (typeof prevContent.caption === "string" ? prevContent.caption : "");

        let nextMedia: unknown = existing.media;
        if (imageFiles.length > 0) {
            nextMedia = await Promise.all(
                imageFiles.map(async (file: Express.Multer.File) => {
                    const { fileUrl } = await upload(file, "shop-post");
                    return fileUrl;
                })
            );
        }

        await prisma.post.update({
            where: { id },
            data: {
                content: { ...prevContent, caption: nextCaption } as object,
                media: nextMedia as object,
            },
        });

        return this.findOne(id);
    }

    async destroy(id: number, memberId: number) {
        const existing = await prisma.post.findFirst({
            where: { id, ...shopPostBaseWhere },
            include: { shop: true },
        });

        if (!existing) {
            throw new NotFoundException("Shop post not found");
        }
        if (existing.shop?.memberId !== memberId) {
            throw new ForbiddenException("You can only delete your own shop posts");
        }

        await prisma.post.delete({
            where: { id },
        });
    }
}

export default ShopPostService;
