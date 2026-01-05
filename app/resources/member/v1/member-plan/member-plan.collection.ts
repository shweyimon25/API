import { MemberPlanResource } from "./member-plan.resource";

export class MemberPlanCollection {
  static toCollection(memberPlans: any[]) {
    return memberPlans.map((memberPlan) => {
      return {
        id: memberPlan.id,
        image: memberPlan.image,
        name: memberPlan.name,
        memberTypeId: memberPlan.memberTypeId,
        memberType: memberPlan.memberType,
        duration: memberPlan.duration,
        price: memberPlan.price,
        isVideoGroup: memberPlan.isVideoGroup,
        status: memberPlan.status,
      }
    });
  }

  static withPagination(memberPlans: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberPlans.data),
      meta: memberPlans.meta,
    };
  }
}
