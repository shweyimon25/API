export class BodyGoalResource {
  static toResource(bodyGoal: any) {
    return {
      id: bodyGoal.id,
      name: bodyGoal.name,
      status: bodyGoal.status,
      createdBy: bodyGoal.createdBy,
      updatedBy: bodyGoal.updatedBy,
      createdAt: bodyGoal.createdAt,
      updatedAt: bodyGoal.updatedAt,
    };
  }
}

