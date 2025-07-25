export class FloorResource {
  static toResource(floor: any) {
    return {
      id: floor.id,
      name: floor.name,
      createdAt: floor.createdAt,
      updatedAt: floor.updatedAt,
    };
  }
}
