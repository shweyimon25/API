export class ProsResource {
  static toResource(pro: any) {
    return {
      id: pro.id,
      name: pro.name,
      guard: pro.guard,
      status: pro.status,
      createdBy: pro.createdBy,
      updatedBy: pro.updatedBy,
      createdAt: pro.createdAt,
      updatedAt: pro.updatedAt,
    };
  }
}

