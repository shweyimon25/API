export class MemberCollection {
  static toCollection(members: any[]) {
    return members;
  }

  static withPagination(members: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(members.data),
      meta: members.meta,
    };
  }
}
