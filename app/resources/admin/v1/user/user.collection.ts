export class UserCollection {
  static toCollection(users: any[]) {
    return users.map((user: any) => ({
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  static withPagination(users: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(users.data),
      meta: users.meta,
    };
  }
}
