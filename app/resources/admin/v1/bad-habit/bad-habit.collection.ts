import { BadHabitResource } from "./bad-habit.resource";

export class BadHabitCollection {
  static toCollection(badHabits: any[]) {
    return badHabits.map((badHabit) => BadHabitResource.toResource(badHabit));
  }

  static toCommonCollection(badHabits: any[]) {
    return badHabits.map((badHabit) => ({
      id: badHabit.id,
      name: badHabit.name,
    }));
  }

  static withPagination(badHabits: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(badHabits.data),
      meta: badHabits.meta,
    };
  }
}

