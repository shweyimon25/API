export class PermissionResource {
    static toResource(permission: any) {
        return {
            id: permission.id,
            name: permission.name,
            description: permission.description,
            status: permission.status,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
        };
    }
}