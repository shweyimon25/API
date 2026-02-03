const TRAINER_MEMBER_TYPE_ID = 2;

function toProfileResource(profile: any, memberTypeId: number | undefined) {
  if (!profile) return null;
  const isTrainer = memberTypeId === TRAINER_MEMBER_TYPE_ID;
  const { yearOfExp, reason, certificates, photos, ...rest } = profile;
  return {
    ...rest,
    ...(isTrainer ? { yearOfExp, reason, certificates, photos } : {}),
  };
}

export class ProfileResource {
  static toResource(member: any) {
    const memberTypeId = member.memberType?.id ?? member.memberTypeId;
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
      profile: toProfileResource(member.profile, memberTypeId),
      memberType: member.memberType ?? null,
      providerTypes: member.providerTypes ?? null,
      fcmTokens: member.memberFcmTokens ?? [],
      shop: member.shop ?? null,
    };
  }
}
