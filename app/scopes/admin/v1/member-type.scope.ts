import { Prisma, Status } from "@prisma/client";

interface MemberTypeScopeQuery {
    name?: string;
    status?: string;
}

export const memberTypeScope = (query: MemberTypeScopeQuery): Prisma.MemberTypeWhereInput => {
    const { name, status } = query;

    const where: Prisma.MemberTypeWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};