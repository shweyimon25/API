import { Prisma, ConversationType } from "@prisma/client";

interface ConversationScopeQuery {
    name?: string;
    type?: string;
    archived?: string;
}

export const conversationScope = (query: ConversationScopeQuery, memberId: number): Prisma.ConversationWhereInput => {
    const { name, type, archived } = query;

    const showArchived = archived === "true";
    const showUnarchivedOnly = archived !== "true";

    const where: Prisma.ConversationWhereInput = {
        participants: {
            some: {
                memberId,
                ...(showArchived ? { isArchived: true } : showUnarchivedOnly ? { isArchived: false } : {}),
            },
        },
    };

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (type) {
        where.type = type as ConversationType;
    }

    return where;
};

