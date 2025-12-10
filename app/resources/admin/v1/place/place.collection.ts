export class PlaceCollection {
  static toCollection(placs: any[]) {
    return placs.map((palce) => ({
      id: palce.id,
      name: palce.name,
      createdAt: palce.createdAt,
      updatedAt: palce.updatedAt,
    }));
  }

  static withPagination(placs: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(placs.data),
      meta: placs.meta,
    };
  }
}

