import { Prisma, PaymentTypes, Status } from "@prisma/client";

interface FriendScopeQuery {
    name?: string;
    email?: string;
    phone?: string;
    code?: string;
}

export const friendScope = (query: FriendScopeQuery): Prisma.FriendWhereInput => {
    const { name, email, phone, code } = query;

    const where: Prisma.FriendWhereInput = {}

    if (name) {
        where.friend = {
            name: {
                contains: name,
                mode: "insensitive",
            }
        }
    }

    if (email) {
        where.friend = {
            email: {
                contains: email,
                mode: "insensitive",
            }
        };
    }

    if (phone) {
        where.friend = {
            phone: {
                contains: phone,
                mode: "insensitive",
            }
        };
    }

    if (code) {
        where.friend = {
            code: {
                contains: code,
                mode: "insensitive",
            }
        };
    }

    return where;
};
