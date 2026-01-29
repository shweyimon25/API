import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

class ShopLevelService {
    async findAll() {
        const shopLevels = await prisma.shopLevel.findMany({
            where: {
                status: Status.ACTIVE,
            },
            orderBy: {
                id: "desc"
            }
        });

        return shopLevels;
    }

    async findCommonAll() {
        const shopLevels = await prisma.shopLevel.findMany({
            where: {
                status: Status.ACTIVE,
            },
            orderBy: {
                id: "desc"
            }
        });

        return shopLevels;
    }

    async findOne(id: number) {
        const shopLevel = await prisma.shopLevel.findFirst({
            where: {
                id,
                status: Status.ACTIVE,
            },
        });

        if (!shopLevel) {
            throw new NotFoundException("Shop level not found");
        }

        return shopLevel;
    }
}

export default ShopLevelService;