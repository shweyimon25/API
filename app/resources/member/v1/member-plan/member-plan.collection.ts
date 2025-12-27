import { MemberPlanResource } from "./member-plan.resource";

export class MemberPlanCollection {
  static toCollection(memberPlans: any[]) {
    return memberPlans.map((memberPlan) =>
      MemberPlanResource.toResource(memberPlan)
    );
  }

  static withPagination(memberPlans: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberPlans.data),
      meta: memberPlans.meta,
    };
  }
}
