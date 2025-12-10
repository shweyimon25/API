export class ProficientLevelResource {
  static toResource(cons: any) {
    return {
      id: cons.id,
      name: cons.name,
      createdAt: cons.createdAt,
      updatedAt: cons.updatedAt,
    };
  }
}

