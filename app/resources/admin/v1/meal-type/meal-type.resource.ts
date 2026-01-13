export class MealTypeResource {
  static toResource(mealType: any) {
    return {
      id: mealType.id,
      name: mealType.name,
      status: mealType.status,
      mealsCount: mealType._count?.meals || 0,
      createdBy: mealType.createdBy,
      updatedBy: mealType.updatedBy,
      createdAt: mealType.createdAt,
      updatedAt: mealType.updatedAt,
    };
  }
}

