import { ProficientLevelResource } from "./proficient-level.resource";

export class ProficientLevelCollection {
  static toCollection(proficientLevels: any[]) {
    return proficientLevels.map((proficientLevel) => ProficientLevelResource.toResource(proficientLevel));
  }

  static toCommonCollection(proficientLevels: any[]) {
    return proficientLevels.map((proficientLevel) => ({
      id: proficientLevel.id,
      name: proficientLevel.name,
    }));
  }

  static withPagination(proficientLevels: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(proficientLevels.data),
      meta: proficientLevels.meta,
    };
  }
}
