export class MemberTypeCollection {
  static toCollection(memberTypes: any[]) {
    return memberTypes.map((memberType) => {
      return {
        id: memberType.id,
        name: memberType.name,
        status: memberType.status,
        createdAt: memberType.createdAt,
        updatedAt: memberType.updatedAt
      }
    });
  }

  static toCommonCollection(memberTypes: any[]) {
    return memberTypes.map((memberType) => {
      return {
        id: memberType.id,
        name: memberType.name
      }
    })
  }

  static withPagination(memberType: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberType.data),
      meta: memberType.meta,
    };
  }
}
