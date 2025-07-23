export class RoleResource {
    static toResource(role: any) {
        return {
            id: role.id,
            name: role.name,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }
}