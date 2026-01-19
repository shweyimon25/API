export class RoleCollection {
  public static toCollection(roles: any[]) {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status,
      createdBy: role.createdBy,
      updatedBy: role.updatedBy,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }

  public static toCommonCollection(roles: any[]) {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
    }));
  }

  public static withPagination(roles: any) {
    return {
      data: roles.data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        status: role.status,
        createdBy: role.createdBy,
        updatedBy: role.updatedBy,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
      meta: roles.meta,
    };
  }
}
