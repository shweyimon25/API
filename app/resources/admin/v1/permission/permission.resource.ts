export class PermissionResource {
    static toResource(permission: any) {
        return {
            id: permission.id,
            name: permission.name,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
        };
    }
}