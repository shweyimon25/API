import { MemberTypeResource } from "./member-type.resource";

export class MemberTypeCollection {
  static toCollection(memberTypes: any[]) {
    return memberTypes.map((memberType) =>
      MemberTypeResource.toResource(memberType)
    );
  }

  static withPagination(memberTypes: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberTypes.data),
      meta: memberTypes.meta,
    };
  }
}
