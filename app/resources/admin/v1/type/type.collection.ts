export class TypeCollection {
  static toCollection(types: any[]) {
    return types.map((type: any) => ({
      id: type.id,
      name: type.name,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
    }));
  }

  static withPagination(types: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(types.data),
      meta: types.meta,
    };
  }
}
