import { RoleResource } from "./role.resource";

export class RoleCollection {
  public static toCollection(roles: any[]) {
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }

  public static withPagination(roles: any) {
    return {
      data: roles.data.map((role: any) => ({
        id: role.id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })),
      meta: roles.meta,
    };
  }
}
