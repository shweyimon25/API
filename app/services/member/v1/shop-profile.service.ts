import { MemberRequestStatus, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
import { CreateShopProfileInput, UpdateShopProfileInput, UpgradeShopProfileInput } from "../../../schemas/member/v1/shop-profile.schema";

class ShopProfileService {
    async profile(memberId: number) {
        const shop = await prisma.shop.findUnique({
            where: {
                memberId
            },
            include: {
                shopLevel: true,
            },
        });

        if (!shop) {
            throw new NotFoundException("Shop not found. Please create a shop first");
        }

        return shop;
    }

    async create(memberId: number, createShopProfileInput: CreateShopProfileInput, files: Express.Multer.File[]) {
        const { name } = createShopProfileInput;

        const existingShop = await prisma.shop.findFirst({
            where: {
                memberId,
                deletedAt: null,
                status: Status.ACTIVE,
            },
        });

        if (existingShop) {
            throw new BadRequestException("You already have a shop. Please update your shop profile instead");
        }

        let image: string | null = null;
        const imageFile = files.find((file: Express.Multer.File) => file.fieldname === "image");

        if (imageFile) {
            const { fileUrl } = await upload(imageFile);
            image = fileUrl;
        }

        await prisma.shop.create({
            data: {
                name,
                memberId,
                image,
            },
            include: {
                shopLevel: true,
            },
        });

        return this.profile(memberId);
    }

    async update(memberId: number, updateShopProfileInput: UpdateShopProfileInput, files: Express.Multer.File[]) {
        const { name } = updateShopProfileInput;

        const shop = await this.profile(memberId);

        let image: string | null = null;
        const imageFile = files.find((file: Express.Multer.File) => file.fieldname === "image");

        if (imageFile) {
            const { fileUrl } = await upload(imageFile);
            image = fileUrl;
        }

        await prisma.shop.update({
            where: {
                memberId,
                id: shop.id,
            },
            data: {
                name: name ?? shop.name,
                image: image ?? shop.image,
            },
        });

        return this.profile(memberId);
    }

    async upgrade(memberId: number, upgradeShopProfileInput: UpgradeShopProfileInput) {
        const { shopLevelId } = upgradeShopProfileInput;

        await this.profile(memberId);

        const shopLevel = await prisma.shopLevel.findUnique({
            where: {
                id: shopLevelId,
                status: Status.ACTIVE,
                deletedAt: null,
            },
        });

        if (!shopLevel) {
            throw new NotFoundException("Shop level not found");
        }

        const existingShopUpgradeRequest = await prisma.shopUpgradeRequest.findFirst({
            where: {
                memberId,
                status: MemberRequestStatus.PENDING
            }
        });

        if (existingShopUpgradeRequest) {
            throw new BadRequestException("Already request shop level upgrade");
        }

        const shopUpgradeRequest = await prisma.shopUpgradeRequest.create({
            data: {
                memberId,
                shopLevelId,
                status: MemberRequestStatus.PENDING
            },
            select: {
                id: true,
                status: true,
                member: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                shopLevel: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        description: true,
                        postLimit: true,
                    }
                },
                createdAt: true,
                updatedAt: true
            }
        });

        return shopUpgradeRequest;
    }
}

export default ShopProfileService;