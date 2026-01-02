export class ConsCollection {
  static toCollection(cons: any[]) {
    return cons.map((con) => ({
      id: con.id,
      name: con.name,
      guard: con.guard,
      status: con.status,
      createdBy: con.createdBy,
      updatedBy: con.updatedBy,
      createdAt: con.createdAt,
      updatedAt: con.updatedAt,
    }));
  }

  static toCommonCollection(cons: any[]) {
    return cons.map((con) => ({
      id: con.id,
      name: con.name,
      guard: con.guard
    }));
  }

  static withPagination(cons: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(cons.data),
      meta: cons.meta,
    };
  }
}

