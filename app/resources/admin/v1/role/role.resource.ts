export class RoleResource {
    static toResource(role: any) {
        return {
            id: role.id,
            name: role.name,
            permissions: role.permissions.map((permission: any) => {
                return {
                    id: permission.permission.id,
                    name: permission.permission.name,
                }
            }),
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }
}