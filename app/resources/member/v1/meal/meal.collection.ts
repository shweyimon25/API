import { MealResource } from "./meal.resource";

export class MealCollection {
  static toCollection(res: any[]) {
    return res.map((meal) => MealResource.toResource(meal));
  }

  static toCommonCollection(meals: any[]) {
    return meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
    }));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

