import { FriendResource } from "./friend.resource";

export class FriendCollection {
  static toCollection(res: any[]) {
    return res.map((member) => FriendResource.toResource(member));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}
