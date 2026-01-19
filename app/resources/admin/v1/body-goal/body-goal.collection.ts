import { BodyGoalResource } from "./body-goal.resource";

export class BodyGoalCollection {
  static toCollection(bodyGoals: any[]) {
    return bodyGoals.map((bodyGoal) => BodyGoalResource.toResource(bodyGoal));
  }

  static toCommonCollection(bodyGoals: any[]) {
    return bodyGoals.map((bodyGoal) => ({
      id: bodyGoal.id,
      name: bodyGoal.name,
    }));
  }

  static withPagination(bodyGoals: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(bodyGoals.data),
      meta: bodyGoals.meta,
    };
  }
}

