export class FriendResource {
  static toResource(member: any) {
    if (!member) return null;
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      code: member.code,
      profile: member.profile ?? null,
    };
  }
}
