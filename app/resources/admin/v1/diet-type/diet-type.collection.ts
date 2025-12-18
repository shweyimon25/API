import { DietTypeResource } from "./diet-type.resource";

export class DietTypeCollection {
  static toCollection(res: any[]) {
    return res.map((dietType) => DietTypeResource.toResource(dietType));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

