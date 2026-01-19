import { UserResource } from "./user.resource";

export class UserCollection {
  static toCollection(users: any[]) {
    return users.map((user: any) => UserResource.toResource(user));
  }

  static toCommonCollection(users: any[]) {
    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    }));
  }

  static withPagination(users: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(users.data),
      meta: users.meta,
    };
  }
}
