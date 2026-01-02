export class ConsResource {
  static toResource(con: any) {
    return {
      id: con.id,
      name: con.name,
      guard: con.guard,
      status: con.status,
      createdBy: con.createdBy,
      updatedBy: con.updatedBy,
      createdAt: con.createdAt,
      updatedAt: con.updatedAt,
    };
  }
}

