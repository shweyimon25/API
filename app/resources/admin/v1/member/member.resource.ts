import { ProviderType } from "@prisma/client";

export class MemberResource {
  static toResource(member: any) {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      language: member.language,
      theme: member.theme,
      code: member.code,
      status: member.status,
      profile: member.profile,
      providerTypes: member.providerTypes?.map((item: { providerType: ProviderType }) => item.providerType),
      fcmTokens: member.memberFcmTokens?.map((item: { token: string }) => item.token),
      memberType: member.memberType,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      createdBy: member.createdBy,
      updatedBy: member.updatedBy,
    };
  }
}
