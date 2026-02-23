import { Prisma, ConversationType } from "@prisma/client";

interface ConversationScopeQuery {
    name?: string;
    type?: string;
}

export const conversationScope = (query: ConversationScopeQuery, memberId: number): Prisma.ConversationWhereInput => {
    const { name, type } = query;

    const where: Prisma.ConversationWhereInput = {
        participants: {
            some: {
                memberId: +memberId,
            }
        }
    };

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (type) {
        where.type = type as ConversationType
    }

    return where;
}

