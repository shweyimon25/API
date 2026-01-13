export class ProficientLevelCollection {
  static toCollection(cons: any[]) {
    return cons.map((con) => ({
      id: con.id,
      name: con.name,
      createdAt: con.createdAt,
      updatedAt: con.updatedAt,
    }));
  }

  static toCommonCollection(proficientLevels: any[]) {
    return proficientLevels.map((proficientLevel) => ({
      id: proficientLevel.id,
      name: proficientLevel.name,
    }));
  }

  static withPagination(cons: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(cons.data),
      meta: cons.meta,
    };
  }
}
