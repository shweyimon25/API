export class CategoryCollection {
  static toCollection(categories: any[]) {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  static withPagination(categories: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(categories.data),
      meta: categories.meta,
    };
  }
}

