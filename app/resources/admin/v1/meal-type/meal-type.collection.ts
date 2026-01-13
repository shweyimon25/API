import { MealTypeResource } from "./meal-type.resource";

export class MealTypeCollection {
  static toCollection(res: any[]) {
    return res.map((mealType) => MealTypeResource.toResource(mealType));
  }

  static toCommonCollection(mealTypes: any[]) {
    return mealTypes.map((mealType) => ({
      id: mealType.id,
      name: mealType.name,
    }));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

