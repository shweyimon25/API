export class DietTypeResource {
  static toResource(dietType: any) {
    return {
      id: dietType.id,
      name: dietType.name,
      photo: dietType.photo,
      description: dietType.description,
      status: dietType.status,
      createdBy: dietType.createdBy,
      updatedBy: dietType.updatedBy,
      createdAt: dietType.createdAt,
      updatedAt: dietType.updatedAt,
    };
  }
}

