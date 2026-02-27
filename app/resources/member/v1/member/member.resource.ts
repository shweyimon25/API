export class MemberResource {
  static toResource(member: any) {
    return {
      id: member.id,
      name: member.name,
      code: member.code,
      email: member.email,
      phone: member.phone,
      memberType: member.memberType,
      profile: member.profile,
      language: member.language,
      theme: member.theme,
      status: member.status,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}
