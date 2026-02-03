import { FriendRequestResource } from "./friend-request.resource";

export class FriendRequestCollection {
  static toCollection(res: any[]) {
    return res.map((request) => FriendRequestResource.toResource(request));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}
