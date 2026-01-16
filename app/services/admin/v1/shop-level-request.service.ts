import { MemberRequestStatus, Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException } from "../../../helpers/exceptions";
import { UpdateShopLevelRequestInput } from "../../../schemas/admin/v1/shop-level-request.schema";
import ShopService from "./shop.service";

class ShopLevelRequestService {
    private shopService: ShopService;

    constructor() {
        this.shopService = new ShopService();
    }

    async findAll(where?: Prisma.ShopUpgradeRequestWhereInput) {
        const shopUpgradeRequests = await prisma.shopUpgradeRequest.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        code: true,
                    },
                },
                shopLevel: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        description: true,
                        postLimit: true,
                    },
                },
            },
        });

        return shopUpgradeRequests;
    }

    async findByPaginate(page: number, perPage: number, where: Prisma.ShopUpgradeRequestWhereInput) {
        const shopUpgradeRequests = await prisma.shopUpgradeRequest.findMany({
            where,
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
                        email: true,
                        phone: true,
                        code: true,
                    },
                },
                shopLevel: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        description: true,
                        postLimit: true,
                    },
                },
            },
        });

        const totalShopUpgradeRequests = await prisma.shopUpgradeRequest.count({
            where,
        });

        return {
            data: shopUpgradeRequests,
            meta: {
                totalCount: totalShopUpgradeRequests,
                totalPages: Math.ceil(totalShopUpgradeRequests / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage:
                    page < Math.ceil(totalShopUpgradeRequests / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalShopUpgradeRequests / perPage),
            },
        };
    }

    async findOne(id: number) {
        const shopUpgradeRequest = await prisma.shopUpgradeRequest.findFirst({
            where: {
                id,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        code: true,
                    },
                },
                shopLevel: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        description: true,
                        postLimit: true,
                    },
                },
            },
        });

        if (!shopUpgradeRequest) {
            throw new NotFoundException("Shop upgrade request not found");
        }

        return shopUpgradeRequest;
    }

    async update(id: number, updateShopLevelRequestInput: UpdateShopLevelRequestInput, userId: number) {
        const { status, rejectedReason } = updateShopLevelRequestInput;

        const existingShopUpgradeRequest = await this.findOne(id);

        if (existingShopUpgradeRequest.status === MemberRequestStatus.APPROVED && status === MemberRequestStatus.APPROVED) {
            throw new BadRequestException("Cannot approve this shop upgrade request because it is already approved. Please make a new request.");
        }

        if (existingShopUpgradeRequest.status === MemberRequestStatus.REJECTED && status === MemberRequestStatus.APPROVED) {
            throw new BadRequestException("Cannot approve this shop upgrade request because it is already rejected. Please make a new request.");
        }

        if (status === MemberRequestStatus.APPROVED) {
            await prisma.shopUpgradeRequest.update({
                where: {
                    id,
                },
                data: {
                    status: MemberRequestStatus.APPROVED,
                    rejectedReason: null,
                    approvedAt: new Date(),
                    approvedBy: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });

            // Update shop's level
            const shop = await prisma.shop.findFirst({
                where: {
                    memberId: existingShopUpgradeRequest.memberId,
                    status: Status.ACTIVE,
                },
            });

            if (shop) {
                await prisma.shop.update({
                    where: {
                        id: shop.id,
                    },
                    data: {
                        shopLevelId: existingShopUpgradeRequest.shopLevelId,
                    },
                });
            }
        }

        if (status === MemberRequestStatus.REJECTED) {
            await prisma.shopUpgradeRequest.update({
                where: {
                    id,
                },
                data: {
                    status: MemberRequestStatus.REJECTED,
                    rejectedReason,
                    rejectedAt: new Date(),
                    rejectedBy: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        }

        return this.findOne(id);
    }
}

export default ShopLevelRequestService;
