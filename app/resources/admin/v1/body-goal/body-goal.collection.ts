export class BodyGoalCollection {
  static toCollection(cons: any[]) {
    return cons.map((con) => ({
      id: con.id,
      name: con.name,
      createdAt: con.createdAt,
      updatedAt: con.updatedAt,
    }));
  }

  static toCommonCollection(bodyGoals: any[]) {
    return bodyGoals.map((bodyGoal) => ({
      id: bodyGoal.id,
      name: bodyGoal.name,
    }));
  }

  static withPagination(cons: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(cons.data),
      meta: cons.meta,
    };
  }
}

