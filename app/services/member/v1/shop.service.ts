import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { CreateShopInput, UpdateShopInput } from "../../../schemas/admin/v1/shop.schema";
import { BadRequestException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";

class ShopService {
    async findAll() {
        const shops = await prisma.shop.findMany({
            orderBy: {
                id: "desc",
            },
        });

        return shops;
    }

    async findByPaginate(page: number, perPage: number) {
        const shops = await prisma.shop.findMany({
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        const totalShops = await prisma.shop.count();

        return {
            data: shops,
            meta: {
                totalCount: totalShops,
                totalPages: Math.ceil(totalShops / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalShops / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalShops / perPage),
            },
        };
    }

    async findOne(id: number) {
        const shop = await prisma.shop.findFirst({
            where: {
                id,
                status: Status.ACTIVE,
                deletedAt: null,
            },
        });

        if (!shop) {
            throw new NotFoundException("Shop not found");
        }

        return shop;
    }
}

export default ShopService;