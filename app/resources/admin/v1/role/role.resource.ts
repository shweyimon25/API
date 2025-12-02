export class RoleResource {
  public static toResource(role: any) {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions?.map((permission: any) => ({
        id: permission.permission.id,
        name: permission.permission.name,
      })) || [],
      users: role.users?.map((user: any) => ({
        id: user.user.id,
        name: user.user.name,
        email: user.user.email,
      })) || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
