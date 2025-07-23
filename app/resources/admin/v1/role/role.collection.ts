export class RoleCollection {
    static toCollection(roles: any[]) {
        return roles.map((role: any) => ({
            id: role.id,
            name: role.name,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        }));
    }

    static withPagination(users: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(users.data),
            meta: users.meta,
        };
    }
}
