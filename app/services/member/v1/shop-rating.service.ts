import prisma from "../../../../prisma/client";
import { CreateShopRatingInput, UpdateShopRatingInput } from "../../../schemas/member/v1/shop-rating.schema";
import { ForbiddenException, NotFoundException } from "../../../helpers/exceptions";

class ShopRatingService {
    async findAll(shopId?: number) {
        const shopRatings = await prisma.shopRating.findMany({
            where: {
                shopId,
            },
            orderBy: {
                id: "desc",
            },
        });

        return shopRatings;
    }

    async findByPaginate(page: number, perPage: number, shopId: number) {
        const shopRatings = await prisma.shopRating.findMany({
            where: {
                shopId,
            },
            orderBy: { id: "desc" },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        const totalShopRatings = await prisma.shopRating.count({ where: { shopId } });

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
