export class ProsCollection {
  static toCollection(pros: any[]) {
    return pros.map((pro) => ({
      id: pro.id,
      name: pro.name,
      guard: pro.guard,
      status: pro.status,
      createdBy: pro.createdBy,
      updatedBy: pro.updatedBy,
      createdAt: pro.createdAt,
      updatedAt: pro.updatedAt,
    }));
  }

  static toCommonCollection(pros: any[]) {
    return pros.map((pro) => ({
      id: pro.id,
      name: pro.name,
      guard: pro.guard,
    }));
  }

  static withPagination(pros: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(pros.data),
      meta: pros.meta,
    };
  }
}

