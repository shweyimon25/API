export class MemberRequestCollection {
  static toCollection(memberRequests: any[]) {
    return memberRequests.map((memberRequest) => {
      return memberRequest;
    });
  }

  static withPagination(memberRequests: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(memberRequests.data),
      meta: memberRequests.meta,
    };
  }
}
