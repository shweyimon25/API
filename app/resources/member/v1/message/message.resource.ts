export class MessageResource {
  static toResource(message: any) {
    return {
      "id": message.id,
      "conversationId": message.conversationId,
      "senderId": message.senderId,
      "content": message.content,
      "readAt": message.readAt,
      "conversation": message.conversation,
      "sender": message.sender,
      "reactionCount": message._count.messageReactions,
      "reactions": message.messageReactions,
      "createdAt": message.createdAt,
      "updatedAt": message.updatedAt
    };
  }
}
