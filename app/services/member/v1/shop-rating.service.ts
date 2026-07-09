import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { CreateShopRatingInput, UpdateShopRatingInput } from "../../../schemas/member/v1/shop-rating.schema";
import { ForbiddenException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { memberShopRatingInclude } from "../../../helpers/member-shop-rating.helper";

export type RpcShopRatingCreateParams = {
    shop_id?: number;
    partner_id?: number;
    count?: number;
    shop_review?: string;
};

const shopRatingInclude = {
    shop: {
        select: { id: true, name: true, logo: true },
    },
    member: {
        select: { id: true, name: true, email: true, code: true },
    },
};

/** Member API: only ratings for ACTIVE shops */
const memberShopRatingWhere = (shopId?: number) => ({
    ...(shopId != null ? { shopId } : {}),
    shop: { status: Status.ACTIVE },
});

class ShopRatingService {
    async findAll(shopId?: number) {
        const shopRatings = await prisma.shopRating.findMany({
            where: memberShopRatingWhere(shopId),
            orderBy: { id: "desc" },
            include: shopRatingInclude,
        });

        return shopRatings;
    }

    async findByPaginate(page: number, perPage: number, shopId: number) {
        const shopRatings = await prisma.shopRating.findMany({
            where: memberShopRatingWhere(shopId),
            orderBy: { id: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
            include: shopRatingInclude,
        });

        const totalShopRatings = await prisma.shopRating.count({
            where: memberShopRatingWhere(shopId),
        });

        return {
            data: shopRatings,
            meta: {
                totalCount: totalShopRatings,
                totalPages: Math.ceil(totalShopRatings / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalShopRatings / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalShopRatings / perPage),
            },
        };
    }

    async findOne(id: number) {
        const shopRating = await prisma.shopRating.findUnique({
            where: { id },
            include: shopRatingInclude,
        });

        if (!shopRating) {
            throw new NotFoundException("Shop rating not found");
        }

        return shopRating;
    }

    async create(createShopRatingInput: CreateShopRatingInput, memberId: number) {
        const { shopId, rate, review } = createShopRatingInput;

        const shopRating = await prisma.shopRating.create({
            data: {
                shopId,
                rate,
                review,
                memberId,
            },
        });

        return this.findOne(shopRating.id);
    }

    async createFromRpcParams(
        params: RpcShopRatingCreateParams,
        loggedInMemberId: number,
    ) {
        const shopId = Number(params.shop_id);
        const partnerId = Number(params.partner_id);
        const rate = Number(params.count);
        const review = params.shop_review?.trim() ?? "";

        if (!Number.isInteger(shopId) || shopId <= 0) {
            throw new ValidationException("Failed to create shop rating", [
                { field: "shop_id", issue: "Shop is required" },
            ]);
        }

        if (!Number.isInteger(partnerId) || partnerId <= 0) {
            throw new ValidationException("Failed to create shop rating", [
                { field: "partner_id", issue: "Partner is required" },
            ]);
        }

        if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
            throw new ValidationException("Failed to create shop rating", [
                { field: "count", issue: "Rating must be between 1 and 5" },
            ]);
        }

        if (partnerId !== loggedInMemberId) {
            throw new ValidationException("Failed to create shop rating", [
                { field: "partner_id", issue: "Partner does not match logged-in member" },
            ]);
        }

        const shop = await prisma.shop.findFirst({
            where: { id: shopId, status: Status.ACTIVE },
        });

        if (!shop) {
            throw new NotFoundException("Shop not found");
        }

        const shopRating = await prisma.shopRating.upsert({
            where: {
                memberId_shopId: {
                    memberId: partnerId,
                    shopId,
                },
            },
            create: {
                shopId,
                memberId: partnerId,
                rate,
                review: review || null,
            },
            update: {
                rate,
                review: review || null,
            },
            include: memberShopRatingInclude,
        });

        return shopRating;
    }

    async update(id: number, updateShopRatingInput: UpdateShopRatingInput, memberId: number) {
        const { shopId, rate, review } = updateShopRatingInput;

        const existingShopRating = await this.findOne(id);

        if (existingShopRating.memberId !== memberId) {
            throw new ForbiddenException("You are not allowed to update this shop rating");
        }

        await prisma.shopRating.update({
            where: { id },
            data: {
                shopId: shopId ?? existingShopRating.shopId,
                rate: rate ?? existingShopRating.rate,
                review: review ?? existingShopRating.review,
            },
        });

        return this.findOne(id);
    }

    async destroy(id: number, memberId: number) {

        const existingShopRating = await this.findOne(id);

        if (existingShopRating.memberId !== memberId) {
            throw new ForbiddenException("You are not allowed to delete this shop rating");
        }

        await prisma.shopRating.delete({
            where: { id },
        });
    }
}

export default ShopRatingService;
