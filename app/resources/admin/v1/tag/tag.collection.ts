import { TagResource } from "./tag.resource";

export class TagCollection {
  static toCollection(res: any[]) {
    return res.map((tag) => TagResource.toResource(tag));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

