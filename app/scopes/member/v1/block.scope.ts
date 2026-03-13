import { Prisma, ConversationType } from "@prisma/client";

interface BlockScopeQuery {
    memberName?: string;
    memberCode?: string;
    memberEmail?: string;
    memberPhone?: string;
}

export const blockScope = (query: BlockScopeQuery, memberId: number): Prisma.BlockWhereInput => {
    const { memberName, memberCode, memberEmail, memberPhone } = query;

    const where: Prisma.BlockWhereInput = {
        memberId,
    };

    if (memberName) {
        where.blockedMember = {
            name: {
                contains: memberName,
                mode: "insensitive",
            },
        };
    }

    if (memberCode) {
        where.blockedMember = {
            code: {
                contains: memberCode,
                mode: "insensitive",
            },
        };
    }
    
    if (memberEmail) {
        where.blockedMember = {
            email: {
                contains: memberEmail,
                mode: "insensitive",
            },
        };
    }
    
    if (memberPhone) {
        where.blockedMember = {
            phone: {
                contains: memberPhone,
                mode: "insensitive",
            },
        };
    }

    return where;
};

