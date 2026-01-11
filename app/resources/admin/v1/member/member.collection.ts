import { ProviderType } from "@prisma/client";

export class MemberCollection {
  static toCollection(members: any[]) {
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      language: member.language,
      theme: member.theme,
      code: member.code,
      profile: member.profile,
      status: member.status,
      providerTypes: member.providerTypes?.map((item: { providerType: ProviderType }) => item.providerType),
      memberType: member.memberType,
      createdBy: member.createdBy,
      updatedBy: member.updatedBy,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));
  }

  static toCommonCollection(members: any[]) {
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      code: member.code,
    }));
  }

  static withPagination(members: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(members.data),
      meta: members.meta,
    };
  }
}
