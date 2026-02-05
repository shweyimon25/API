import { ProviderType } from "@prisma/client";

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
      code: member.code,
      name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status,
      language: member.language,
      theme: member.theme,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      profile: toProfileResource(member.profile, memberTypeId),
      memberType: member.memberType,
      providerTypes: member.providerTypes && member.providerTypes.map((item: { providerType: ProviderType }) => item.providerType),
      fcmToken: member.fcmToken,
      shop: member.shop,
    };
  }
}
