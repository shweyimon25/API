export class PlaceResource {
  static toResource(places: any) {
    return {
      id: places.id,
      name: places.name,
      createdBy: places.createdBy,
      updatedBy: places.updatedBy,
      createdAt: places.createdAt,
      updatedAt: places.updatedAt,
    };
  }
}

