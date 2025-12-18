export class BadHabitResource {
  static toResource(badHabit: any) {
    return {
      id: badHabit.id,
      description: badHabit.description,
      photo: badHabit.photo,
      status: badHabit.status,
      createdBy: badHabit.createdBy
        ? {
            id: badHabit.createdBy.id,
            name: badHabit.createdBy.name,
            email: badHabit.createdBy.email,
            username: badHabit.createdBy.username,
          }
        : null,
      updatedBy: badHabit.updatedBy
        ? {
            id: badHabit.updatedBy.id,
            name: badHabit.updatedBy.name,
            email: badHabit.updatedBy.email,
            username: badHabit.updatedBy.username,
          }
        : null,
      createdAt: badHabit.createdAt,
      updatedAt: badHabit.updatedAt,
    };
  }
}

