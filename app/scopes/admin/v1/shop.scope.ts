import { Prisma, Status } from "@prisma/client";

interface ShopScopeQuery {
    name?: string;
    memberName?: string;
    memberEmail?: string;
    memberCode?: string;
    shopLevelId?: string;
    status?: string;
}

export const shopScope = (query: ShopScopeQuery): Prisma.ShopWhereInput => {
    const { name, memberName, memberEmail, memberCode, shopLevelId, status } = query;

    const where: Prisma.ShopWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        }
    }

    if (memberName) {
        where.member = {
            name: {
                contains: memberName,
                mode: "insensitive"
            }
        }
    }

    if (memberEmail) {
        where.member = {
            email: {
                contains: memberEmail,
                mode: "insensitive"
            }
        }
    }

    if (memberCode) {
        where.member = {
            code: {
                contains: memberCode,
                mode: "insensitive"
            }
        }
    }

    if (shopLevelId) {
        where.shopLevelId = +shopLevelId;
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};