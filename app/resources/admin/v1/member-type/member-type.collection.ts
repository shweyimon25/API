export class MemberTypeCollection {
  static toCollection(res: any[]) {
    return res;
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}
