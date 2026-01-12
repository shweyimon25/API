import { WorkoutResource } from "./workout.resource";

export class WorkoutCollection {
  static toCollection(workouts: any[]) {
    return workouts.map((workout) => WorkoutResource.toResource(workout));
  }

  static toCommonCollection(workouts: any[]) {
    return workouts.map((workout) => ({
      id: workout.id,
      name: workout.name,
    }));
  }

  static withPagination(workouts: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(workouts.data),
      meta: workouts.meta,
    };
  }
}
