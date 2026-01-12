export class WorkoutResource {
  static toResource(workout: any) {
    return {
      id: workout.id,
      name: workout.name,
      video: workout.video,
      thumbnail: workout.thumbnail,
      category: workout.category,
      bodyGoal: workout.bodyGoal,
      proficientLevel: workout.proficientLevel,
      place: workout.place,
      memberPlan: workout.memberPlan,
      workoutDay: workout.workoutDay,
      videoDuration: workout.videoDuration,
      sets: workout.sets,
      reps: workout.reps,
      status: workout.status,
      createdBy: workout.createdBy,
      updatedBy: workout.updatedBy,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
    };
  }
}
