export class CategoryResource {
  static toResource(category: any) {
    return {
      id: category.id,
      name: category.name,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
