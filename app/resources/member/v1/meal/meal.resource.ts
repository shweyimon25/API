export class MealResource {
  static toResource(meal: any) {
    return {
      id: meal.id,
      name: meal.name,
      cal: meal.cal,
      carb: meal.carb,
      protein: meal.protein,
      fat: meal.fat,
      mealType: meal.mealType,
      status: meal.status,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
    };
  }
}

