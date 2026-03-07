export class MessageCollection {
  static toCollection(messages: any[]) {
    return messages.map((message) => {
      return {
        "id": message.id,
        "conversationId": message.conversationId,
        "senderId": message.senderId,
        "content": message.content,
        "readAt": message.readAt,
        "conversation": message.conversation,
        "sender": message.sender,
        "reactionCount": message._count.messageReactions,
        "createdAt": message.createdAt,
        "updatedAt": message.updatedAt
      }
    });
  }

  static withPagination(memberTypes: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberTypes.data),
      meta: memberTypes.meta,
    };
  }
}
