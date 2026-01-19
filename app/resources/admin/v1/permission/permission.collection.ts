export class PermissionCollection {
    static toCollection(permissions: any[]) {
        return permissions.map((permission: any) => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            status: permission.status,
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
        }));
    }

    static toCommonCollection(permissions: any[]) {
        return permissions.map((permission: any) => ({
            id: permission.id,
            name: permission.name,
        }));
    }

    static withPagination(permissions: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(permissions.data),
            meta: permissions.meta,
        };
    }
}
