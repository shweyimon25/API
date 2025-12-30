export class UserResource {
  static toResource(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      status: user.status,
      roles: user.roles.map((r: any) => {
        return {
          id: r.role.id,
          name: r.role.name,
        };
      }),
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
