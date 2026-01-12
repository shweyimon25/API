export class MemberPlanCollection {
  static toCollection(memberPlans: any[]) {
    return memberPlans.map((memberPlan) => ({
      id: memberPlan.id,
      name: memberPlan.name,
      image: memberPlan.image,
      memberTypeId: memberPlan.memberTypeId,
      memberType: memberPlan.memberType,
      price: memberPlan.price,
      duration: memberPlan.duration,
      isVideoGroup: memberPlan.isVideoGroup,
      status: memberPlan.status,
      createdAt: memberPlan.createdAt,
      updatedAt: memberPlan.updatedAt,
      createdBy: memberPlan.createdBy,
      updatedBy: memberPlan.updatedBy,
    }));
  }

  static toCommonCollection(memberPlans: any[]) {
    return memberPlans.map((memberPlan) => ({
      id: memberPlan.id,
      name: memberPlan.name,
    }));
  }

  static withPagination(memberPlans: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberPlans.data),
      meta: memberPlans.meta,
    };
  }
}
