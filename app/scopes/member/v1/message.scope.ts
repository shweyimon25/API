import { Prisma } from "@prisma/client";

interface MessageScopeQuery {
    conversationId?: string,
    content?: string,
}

export const messageScope = (query: MessageScopeQuery, memberId?: number): Prisma.MessageWhereInput => {
    const {
        conversationId,
        content,
    } = query;

    const where: Prisma.MessageWhereInput = {};

    // Only include messages in conversations where the current member is a participant
    if (memberId != null) {
        where.conversation = {
            participants: {
                some: { memberId }
            }
        };
    }

    if (conversationId) {
        where.conversationId = +conversationId
    }

    if (content) {
        where.content = {
            contains: content,
            mode: "insensitive"
        };
    }

    return where;
};