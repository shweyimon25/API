export class WorkoutResource {
  static toResource(workout: any) {
    return {
      id: workout.id,
      name: workout.name,
      video: workout.video,
      thumbnail: workout.thumbnail,
      gender: workout.gender,
      category: workout.category ?? null,
      bodyGoal: workout.bodyGoal ?? null,
      proficientLevel: workout.proficientLevel ?? null,
      place: workout.place ?? null,
      memberPlan: workout.memberPlan ?? null,
      workoutDay: workout.workoutDay,
      videoDuration: workout.videoDuration,
      sets: workout.sets,
      reps: workout.reps,
      status: workout.status,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
    };
  }
}
