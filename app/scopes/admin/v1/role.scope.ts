import { Prisma, Status } from "@prisma/client";

interface RoleScopeQuery {
    name?: string;
    description?: string;
    status?: string;
}

export const roleScope = (query: RoleScopeQuery): Prisma.RoleWhereInput => {
    const { name, description, status } = query;

    const where: Prisma.RoleWhereInput = {};

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