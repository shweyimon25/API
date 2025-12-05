export class ProsResource {
  static toResource(pros: any) {
    return {
      id: pros.id,
      name: pros.name,
      guard: pros.guard,
      memberPlans: pros.memberPlans?.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
      })) || [],
      createdAt: pros.createdAt,
      updatedAt: pros.updatedAt,
    };
  }
}

