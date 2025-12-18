import { BadHabitResource } from "./bad-habit.resource";

export class BadHabitCollection {
  static toCollection(res: any[]) {
    return res.map((badHabit) => BadHabitResource.toResource(badHabit));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

