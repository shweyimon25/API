export class DietaryResource {
    static toResource(dietary: any) {
        return {
            id: dietary.id,
            name: dietary.name,
            createdAt: dietary.createdAt,
            updatedAt: dietary.updatedAt,
        };
    }
}