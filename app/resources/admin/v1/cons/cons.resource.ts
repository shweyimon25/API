export class ConsResource {
  static toResource(cons: any) {
    return {
      id: cons.id,
      name: cons.name,
      guard: cons.guard,
      memberPlans: cons.memberPlans?.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
      })) || [],
      createdAt: cons.createdAt,
      updatedAt: cons.updatedAt,
    };
  }
}

