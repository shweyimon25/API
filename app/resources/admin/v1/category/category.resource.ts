export class CategoryResource {
  static toResource(categories: any) {
    return {
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    };
  }
}
