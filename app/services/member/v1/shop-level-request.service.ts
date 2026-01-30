import { MemberRequestStatus } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { ValidationException } from "../../../helpers/exceptions";
import { ShopLevelRequestInput } from "../../../schemas/member/v1/shop-level-request.schema";

class ShopLevelRequestService {
    async shopLevelRequest(data: ShopLevelRequestInput, memberId: number) {
        const { shopLevelId } = data;

        const shopLevel = await prisma.shopLevel.findFirst({
            where: {
                id: shopLevelId,
            },
        });

        if (!shopLevel) {
            throw new ValidationException("Shop level not found", [
                {
                    field: "shopLevelId",
                    issue: "Shop level not found",
                },
            ]);
        }

        const shopLevelRequest = await prisma.shopUpgradeRequest.create({
            data: {
                memberId,
                shopLevelId,
                status: MemberRequestStatus.PENDING,
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

        return shopLevelRequest;
    }
}

export default ShopLevelRequestService;