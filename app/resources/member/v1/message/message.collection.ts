import { MessageResource } from "./message.resource";

export class MessageCollection {
  static toCollection(messages: any[]) {
    return messages.map((message) =>
      MessageResource.toResource(message)
    );
  }

  static withPagination(memberTypes: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberTypes.data),
      meta: memberTypes.meta,
    };
  }
}
