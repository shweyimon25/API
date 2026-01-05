import { Pros } from "@prisma/client";

export class MemberPlanResource {
  static toResource(memberPlan: any) {
    return {
      id: memberPlan.id,
      name: memberPlan.name,
      image: memberPlan.image,
      memberTypeId: memberPlan.memberTypeId,
      memberType: memberPlan.memberType,
      duration: memberPlan.duration,
      price: memberPlan.price,
      isVideoGroup: memberPlan.isVideoGroup,
      status: memberPlan.status,
      pros: memberPlan.pros,
      cons: memberPlan.cons,
    };
  }
}
