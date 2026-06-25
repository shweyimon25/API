import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, ForbiddenException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { CreateShopInput, UpdateShopInput } from "../../../schemas/member/v1/shop.schema";
import { upload, uploadBase64Image } from "../../../helpers/media-upload";
import { memberShopInclude, resolveMemberIdFromPartnerId } from "../../../helpers/member-shop.helper";

export type RpcShopCreateParams = {
    name?: string;
    partner_id?: number;
};

export type RpcShopUpdateParams = {
    name?: string;
    image?: string;
};

/** Member API: always only ACTIVE shops */
const memberShopWhere = (where?: Prisma.ShopWhereInput): Prisma.ShopWhereInput => ({
    ...where,
    status: Status.ACTIVE,
});

export default class ShopService {
    async findAll(where?: Prisma.ShopWhereInput) {
        const shops = await prisma.shop.findMany({
            where: memberShopWhere(where),
            orderBy: { id: "desc" },
        });

        return shops;
    }

    async findByPaginate(page: number, perPage: number, where?: Prisma.ShopWhereInput) {
        const shops = await prisma.shop.findMany({
            where: memberShopWhere(where),
            orderBy: { id: "desc" },
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

        const totalShops = await prisma.shop.count({
            where: memberShopWhere(where),
        });

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

    async createFromRpcParams(params: RpcShopCreateParams, loggedInMemberId: number) {
        const name = params.name?.trim();
        const partnerId = Number(params.partner_id);

        if (!name) {
            throw new ValidationException("Failed to create shop", [
                { field: "name", issue: "Shop name is required" },
            ]);
        }

        if (!Number.isInteger(partnerId) || partnerId <= 0) {
            throw new ValidationException("Failed to create shop", [
                { field: "partner_id", issue: "Partner is required" },
            ]);
        }

        const memberId = resolveMemberIdFromPartnerId(partnerId);
        if (memberId !== loggedInMemberId) {
            throw new ValidationException("Failed to create shop", [
                { field: "partner_id", issue: "Partner does not match logged-in member" },
            ]);
        }

        const member = await prisma.member.findFirst({
            where: { id: memberId, status: Status.ACTIVE },
        });

        if (!member) {
            throw new ValidationException("Failed to create shop", [
                { field: "partner_id", issue: "Member not found" },
            ]);
        }

        const existingShop = await prisma.shop.findUnique({
            where: { memberId },
        });

        if (existingShop) {
            throw new BadRequestException("You already have a shop. Please update your shop profile instead");
        }

        const freeShopLevel = await prisma.shopLevel.findFirst({
            where: { name: "Free", status: Status.ACTIVE },
        });

        const shop = await prisma.shop.create({
            data: {
                name,
                memberId,
                shopLevelId: freeShopLevel?.id,
                status: Status.ACTIVE,
            },
            include: memberShopInclude,
        });

        return shop;
    }

    async updateFromRpcParams(
        id: number,
        params: RpcShopUpdateParams,
        loggedInMemberId: number
    ) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new ValidationException("Failed to update shop", [
                { field: "id", issue: "Shop id is required" },
            ]);
        }

        const existingShop = await this.findOne(id);

        if (existingShop.memberId !== loggedInMemberId) {
            throw new ForbiddenException("You are not allowed to update this shop");
        }

        const name = params.name?.trim();
        const imageBase64 = params.image?.trim();
        let logoUrl: string | undefined;

        if (imageBase64) {
            const uploaded = await uploadBase64Image(imageBase64, "shop");
            if (uploaded) {
                logoUrl = uploaded;
            }
        }

        if (!name && !logoUrl) {
            throw new ValidationException("Failed to update shop", [
                { field: "name", issue: "At least one field is required to update" },
            ]);
        }

        const shop = await prisma.shop.update({
            where: { id, memberId: loggedInMemberId },
            data: {
                ...(name ? { name } : {}),
                ...(logoUrl ? { logo: logoUrl } : {}),
            },
            include: memberShopInclude,
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