export class ProficientLevelResource {
  static toResource(proficientLevel: any) {
    return {
      id: proficientLevel.id,
      name: proficientLevel.name,
      status: proficientLevel.status,
      createdBy: proficientLevel.createdBy,
      updatedBy: proficientLevel.updatedBy,
      createdAt: proficientLevel.createdAt,
      updatedAt: proficientLevel.updatedAt,
    };
  }
}

