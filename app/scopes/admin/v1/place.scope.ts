import { Prisma, Status } from "@prisma/client";

interface PlaceScopeQuery {
    name?: string;
    status?: string;
}

export const placeScope = (query: PlaceScopeQuery): Prisma.PlaceWhereInput => {
    const { name, status } = query;

    const where: Prisma.PlaceWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};
