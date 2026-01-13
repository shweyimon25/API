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
      createdBy: meal.createdBy,
      updatedBy: meal.updatedBy,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
    };
  }
}

