import { PostResource } from "./post.resource";

export class PostCollection {
  static toCollection(res: any[]) {
    return res.map((post) => PostResource.toResource(post));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

