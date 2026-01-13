export class CategoryResource {
  static toResource(categories: any) {
    return {
      id: categories.id,
      name: categories.name,
      createdBy: categories.createdBy,
      updatedBy: categories.updatedBy,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    };
  }
}
