import { Prisma, Status } from "@prisma/client";

interface PermissionScopeQuery {
    name?: string;
    description?: string;
    status?: string;
}

export const permissionScope = (query: PermissionScopeQuery): Prisma.PermissionWhereInput => {
    const { name, description, status } = query;

    const where: Prisma.PermissionWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (description) {
        where.description = {
            contains: description,
            mode: "insensitive"
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};