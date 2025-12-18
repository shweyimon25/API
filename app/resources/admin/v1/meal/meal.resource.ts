export class MealResource {
  static toResource(meal: any) {
    return {
      id: meal.id,
      name: meal.name,
      cal: meal.cal,
      carb: meal.carb,
      protein: meal.protein,
      fat: meal.fat,
      mealType: meal.mealType
        ? {
            id: meal.mealType.id,
            name: meal.mealType.name,
          }
        : null,
      status: meal.status,
      createdBy: meal.createdBy
        ? {
            id: meal.createdBy.id,
            name: meal.createdBy.name,
            email: meal.createdBy.email,
            username: meal.createdBy.username,
          }
        : null,
      updatedBy: meal.updatedBy
        ? {
            id: meal.updatedBy.id,
            name: meal.updatedBy.name,
            email: meal.updatedBy.email,
            username: meal.updatedBy.username,
          }
        : null,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
    };
  }
}

