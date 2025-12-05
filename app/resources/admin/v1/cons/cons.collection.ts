export class ConsCollection {
  static toCollection(cons: any[]) {
    return cons.map((con) => ({
      id: con.id,
      name: con.name,
      guard: con.guard,
      createdAt: con.createdAt,
      updatedAt: con.updatedAt,
    }));
  }

  static withPagination(cons: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(cons.data),
      meta: cons.meta,
    };
  }
}

