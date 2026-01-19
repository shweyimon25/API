export class PlaceResource {
  static toResource(place: any) {
    return {
      id: place.id,
      name: place.name,
      status: place.status,
      createdBy: place.createdBy,
      updatedBy: place.updatedBy,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
    };
  }
}

