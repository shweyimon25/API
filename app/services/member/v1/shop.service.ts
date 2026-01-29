import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, ForbiddenException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { CreateShopInput, UpdateShopInput } from "../../../schemas/member/v1/shop.schema";
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
            },
        });

        if (!shop) {
            throw new NotFoundException("Shop not found");
        }

        return shop;
    }

    async create(createShopInput: CreateShopInput, files: Express.Multer.File[], memberId: number) {
        const { name } = createShopInput;

        const existingShop = await prisma.shop.findUnique({
            where: { memberId },
        });

        if (existingShop) {
            throw new BadRequestException("You already have a shop. Please update your shop profile instead");
        }

        const logo = files.find((file: Express.Multer.File) => file.fieldname === "logo");

        if (!logo) {
            throw new ValidationException("Failed to create shop", [
                { field: "logo", issue: "Logo is required" },
            ]);
        }

        const { fileUrl: logoUrl } = await upload(logo, "shop");

        const shop = await prisma.shop.create({
            data: {
                name,
                logo: logoUrl,
                memberId,
                status: Status.ACTIVE,
            }
        });

        return shop;
    }

    async update(id: number, updateShopInput: UpdateShopInput, files: Express.Multer.File[], memberId: number,) {
        const { name } = updateShopInput;

        const existingShop = await this.findOne(id);

        if (existingShop.memberId !== memberId) {
            throw new ForbiddenException("You are not allowed to update this shop");
        }

        const logo = files.find((file: Express.Multer.File) => file.fieldname === "logo");

        let logoUrl: string | null = null;
        if (logo) {
            const { fileUrl } = await upload(logo, "shop");
            logoUrl = fileUrl;
        }

        await prisma.shop.update({
            where: { id, memberId },
            data: {
                name: name ?? existingShop.name,
                logo: logoUrl ?? existingShop.logo,
            },
        });

        return this.findOne(id);
    }

    async destroy(id: number, memberId: number) {
        const existingShop = await this.findOne(id);

        if (existingShop.memberId !== memberId) {
            throw new ForbiddenException("You are not allowed to delete this shop");
        }

        await prisma.shop.delete({
            where: { id, memberId },
        });
    }
}

export default ShopService;