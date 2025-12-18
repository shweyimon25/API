import { MealResource } from "./meal.resource";

export class MealCollection {
  static toCollection(res: any[]) {
    return res.map((meal) => MealResource.toResource(meal));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

