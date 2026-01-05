export class MemberTypeResource {
  static toResource(memberType: any) {
    return {
      id: memberType.id,
      name: memberType.name,
      status: memberType.status,
    };
  }
}
