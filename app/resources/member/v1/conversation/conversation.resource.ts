export class ConversationResource {
    static toResource(conversation: any) {
        return {
            id: conversation.id,
            image: conversation.image,
            name: conversation.name,
            type: conversation.type,
            bodyGoal: conversation.bodyGoal,
            gender: conversation.gender,
            proficientLevel: conversation.proficientLevel,
            isRequest: conversation.isRequest,
            latestMessage: conversation.messages > 0 ? null : conversation.messages[0],
            messages: conversation.messages,
            memberPlan: conversation.memberPlan,
            participants: conversation.participants,
            participantCount: conversation._count?.participants,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
}
