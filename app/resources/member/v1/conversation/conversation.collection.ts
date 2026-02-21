export class ConversationCollection {
  static toCollection(conversations: any[]) {
    return conversations.map((conversation) => {
      return {
        id: conversation.id,
        name: conversation.name,
        type: conversation.type,
        image: conversation.image,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  }

  static toCommonCollection(conversations: any[]) {
    return conversations.map((conversation) => {
      return {
        id: conversation.id,
        name: conversation.name,
        type: conversation.type,
        image: conversation.image
      }
    });
  }

  static withPagination(conversations: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(conversations.data),
      meta: conversations.meta,
    };
  }
}
