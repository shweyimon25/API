import { FriendResource } from "./friend.resource";

export class FriendCollection {
  static toCollection(res: any[]) {
    return res.map((friend) => FriendResource.toResource(friend));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}
