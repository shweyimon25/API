export class ProsCollection {
  static toCollection(pros: any[]) {
    return pros.map((pro) => ({
      id: pro.id,
      name: pro.name,
      guard: pro.guard,
      createdAt: pro.createdAt,
      updatedAt: pro.updatedAt,
    }));
  }

  static withPagination(pros: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(pros.data),
      meta: pros.meta,
    };
  }
}

