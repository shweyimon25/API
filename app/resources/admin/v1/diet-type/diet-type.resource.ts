export class DietTypeResource {
  static toResource(dietType: any) {
    return {
      id: dietType.id,
      name: dietType.name,
      photo: dietType.photo,
      description: dietType.description,
      status: dietType.status,
      createdBy: dietType.createdBy
        ? {
            id: dietType.createdBy.id,
            name: dietType.createdBy.name,
            email: dietType.createdBy.email,
            username: dietType.createdBy.username,
          }
        : null,
      updatedBy: dietType.updatedBy
        ? {
            id: dietType.updatedBy.id,
            name: dietType.updatedBy.name,
            email: dietType.updatedBy.email,
            username: dietType.updatedBy.username,
          }
        : null,
      createdAt: dietType.createdAt,
      updatedAt: dietType.updatedAt,
    };
  }
}

