export class FloorCollection {
  static toCollection(floors: any[]) {
    return floors.map((floor: any) => ({
      id: floor.id,
      name: floor.name,
      createdAt: floor.createdAt,
      updatedAt: floor.updatedAt,
    }));
  }

  static withPagination(floors: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(floors.data),
      meta: floors.meta,
    };
  }
}
