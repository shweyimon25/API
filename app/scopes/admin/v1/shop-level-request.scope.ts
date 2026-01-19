import { Prisma, MemberRequestStatus } from "@prisma/client";

interface ShopLevelRequestScopeQuery {
    memberName?: string;
    memberEmail?: string;
    memberCode?: string;
    shopLevelId?: string;
    status?: string;
}

export const shopLevelRequestScope = (query: ShopLevelRequestScopeQuery): Prisma.ShopUpgradeRequestWhereInput => {
    const {
        memberName,
        memberEmail,
        memberCode,
        shopLevelId,
        status,
    } = query;

    const where: Prisma.ShopUpgradeRequestWhereInput = {};

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

    if (status) {
        where.status = status as MemberRequestStatus;
    }

    return where;
};