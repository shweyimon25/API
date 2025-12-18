export class MealTypeResource {
  static toResource(mealType: any) {
    return {
      id: mealType.id,
      name: mealType.name,
      status: mealType.status,
      mealsCount: mealType._count?.meals || 0,
      createdBy: mealType.createdBy
        ? {
            id: mealType.createdBy.id,
            name: mealType.createdBy.name,
            email: mealType.createdBy.email,
            username: mealType.createdBy.username,
          }
        : null,
      updatedBy: mealType.updatedBy
        ? {
            id: mealType.updatedBy.id,
            name: mealType.updatedBy.name,
            email: mealType.updatedBy.email,
            username: mealType.updatedBy.username,
          }
        : null,
      createdAt: mealType.createdAt,
      updatedAt: mealType.updatedAt,
    };
  }
}

