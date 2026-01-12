export class MemberPlanResource {
  static toResource(memberPlan: any) {
    return {
      id: memberPlan.id,
      name: memberPlan.name,
      image: memberPlan.image,
      memberTypeId: memberPlan.memberTypeId,
      price: memberPlan.price,
      pros: memberPlan.pros,
      cons: memberPlan.cons,
      duration: memberPlan.duration,
      isVideoGroup: memberPlan.isVideoGroup,
      memberType: memberPlan.memberType,
      status: memberPlan.status,
      createdAt: memberPlan.createdAt,
      updatedAt: memberPlan.updatedAt,
      createdBy: memberPlan.createdBy,
      updatedBy: memberPlan.updatedBy,
    };
  }
}
