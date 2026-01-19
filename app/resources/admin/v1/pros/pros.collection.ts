import { ProsResource } from "./pros.resource";

export class ProsCollection {
  static toCollection(pros: any[]) {
    return pros.map((pro) => ProsResource.toResource(pro));
  }

  static toCommonCollection(pros: any[]) {
    return pros.map((pro) => ({
      id: pro.id,
      name: pro.name,
      guard: pro.guard,
    }));
  }

  static withPagination(pros: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(pros.data),
      meta: pros.meta,
    };
  }
}

