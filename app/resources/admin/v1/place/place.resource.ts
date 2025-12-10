export class PlaceResource {
  static toResource(places: any) {
    return {
      id: places.id,
      name: places.name,
      createdAt: places.createdAt,
      updatedAt: places.updatedAt,
    };
  }
}

