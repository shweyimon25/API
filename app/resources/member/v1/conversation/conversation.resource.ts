export class ConversationResource {
    static toResource(conversation: any) {
        return {
            id: conversation.id,
            image: conversation.image,
            type: conversation.type,
            name: conversation.name,
            participants: conversation.participants,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        };
    }
}
