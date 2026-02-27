import { MemberResource } from "./member.resource";

export class MemberCollection {
  static toCollection(members: any[]) {
    return members.map((member) => MemberResource.toResource(member));
  }

  static toCommonCollection(members: any[]) {
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      profile: member.profile,
    }));
  }

  static withPagination(bankInformations: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(bankInformations.data),
      meta: bankInformations.meta,
    };
  }
}
