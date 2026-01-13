export class ProficientLevelResource {
  static toResource(cons: any) {
    return {
      id: cons.id,
      name: cons.name,
      createdBy: cons.createdBy,
      updatedBy: cons.updatedBy,
      createdAt: cons.createdAt,
      updatedAt: cons.updatedAt,
    };
  }
}

