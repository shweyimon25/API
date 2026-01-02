export class RoleResource {
  public static toResource(role: any) {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions?.map((permission: any) => ({
        id: permission.permission.id,
        name: permission.permission.name,
      })) || [],
      status: role.status,
      createdBy: role.createdBy,
      updatedBy: role.updatedBy,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
