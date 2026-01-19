import { Gender, Prisma, Status } from "@prisma/client";

interface MemberScopeQuery {
    name?: string;
    code?: string;
    email?: string;
    phone?: string;
    memberTypeId?: string;
    gender?: string;
    minAge?: string;
    maxAge?: string;
    minYearOfExp?: string;
    maxYearOfExp?: string;
    address?: string;
    status?: string;
}

export const memberScope = (query: MemberScopeQuery): Prisma.MemberWhereInput => {
    const {
        name,
        code,
        email,
        phone,
        memberTypeId,
        gender,
        minAge,
        maxAge,
        minYearOfExp,
        maxYearOfExp,
        address,
        status,
    } = query;

    const where: Prisma.MemberWhereInput = {};

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive"
        };
    }

    if (code) {
        where.code = {
            contains: code,
            mode: "insensitive"
        };
    }

    if (email) {
        where.email = {
            contains: email,
            mode: "insensitive"
        };
    }

    if (phone) {
        where.phone = {
            contains: phone,
            mode: "insensitive"
        };
    }

    if (memberTypeId) {
        where.memberTypeId = +memberTypeId;
    }

    if (gender) {
        where.profile = {
            gender: gender as Gender
        };
    }

    if (minAge) {
        where.profile = {
            age: {
                gte: +minAge
            }
        };
    }

    if (maxAge) {
        where.profile = {
            age: {
                lte: +maxAge
            }
        };
    }

    if (minYearOfExp) {
        where.profile = {
            yearOfExp: {
                gte: +minYearOfExp
            }
        };
    }

    if (maxYearOfExp) {
        where.profile = {
            yearOfExp: {
                lte: +maxYearOfExp
            }
        };
    }

    if (address) {
        where.profile = {
            address: {
                contains: address,
                mode: "insensitive"
            }
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};