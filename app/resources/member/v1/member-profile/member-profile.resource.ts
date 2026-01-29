/**
 * Global profile resource – use for all member-facing responses
 * that return member/user data (auth signIn, signUp, reset password, profile, etc.)
 */
export class ProfileResource {
  static toResource(member: any) {
    if (!member) return null;
    return {
      id: member.id,
      code: member.code ?? null,
      name: member.name,
      email: member.email ?? null,
      phone: member.phone ?? null,
      status: member.status ?? null,
      language: member.language ?? null,
      theme: member.theme ?? null,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      profile: member.profile ?? null,
      memberType: member.memberType ?? null,
      providerTypes: member.providerTypes ?? null,
      shop: member.shop ?? null,
    };
  }
}
