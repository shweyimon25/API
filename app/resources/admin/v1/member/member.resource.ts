export class MemberResource {
  static toResource(member: any) {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      username: member.username,
      status: member.status,
      providerTypes: member.providerTypes
        ? member.providerTypes.map((pt: any) => pt.providerType)
        : [],
      memberType: member.memberType
        ? {
            id: member.memberType.id,
            name: member.memberType.name,
          }
        : null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
