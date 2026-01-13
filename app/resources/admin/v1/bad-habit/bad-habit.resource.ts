export class BadHabitResource {
  static toResource(badHabit: any) {
    return {
      id: badHabit.id,
      name: badHabit.name,
      description: badHabit.description,
      status: badHabit.status,
      createdBy: badHabit.createdBy,
      updatedBy: badHabit.updatedBy,
      createdAt: badHabit.createdAt,
      updatedAt: badHabit.updatedAt,
    };
  }
}

