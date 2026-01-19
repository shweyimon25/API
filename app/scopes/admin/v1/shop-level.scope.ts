import { Prisma, Status } from "@prisma/client";

interface ShopLevelScopeQuery {
    name?: string;
    minPrice?: string;
    maxPrice?: string;
    duration?: string;
    postLimit?: string;
    status?: string;
}

export const shopLevelScope = (query: ShopLevelScopeQuery): Prisma.ShopLevelWhereInput => {
    const {
        name,
        minPrice,
        maxPrice,
        duration,
        postLimit,
        status,
    } = query;

    const where: Prisma.ShopLevelWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (minPrice) {
        where.price = {
            gte: +minPrice
        };
    }

    if (maxPrice) {
        where.price = {
            lte: +maxPrice
        };
    }

    if (duration) {
        where.duration = {
            equals: +duration
        };
    }

    if (postLimit) {
        where.postLimit = {
            equals: +postLimit
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};