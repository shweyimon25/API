import { Prisma, Status } from "@prisma/client";

interface UserScopeQuery {
    name?: string;
    email?: string;
    username?: string;
    status?: string;
    roleId?: string;
}

export const userScope = (query: UserScopeQuery): Prisma.UserWhereInput => {
    const { name, email, username, status, roleId } = query;

    const where: Prisma.UserWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (email) {
        where.email = {
            contains: email,
            mode: "insensitive"
        };
    }

    if (username) {
        where.username = {
            contains: username,
            mode: "insensitive"
        };
    }

    if (status) {
        where.status = status as Status;
    }

    if (roleId) {
        where.roles = {
            some: {
                roleId: +roleId,
            },
        };
    }

    return where;
};