export class CuisineResource {
    static toResource(cuisine: any) {
        return {
            id: cuisine.id,
            name: cuisine.name,
            createdAt: cuisine.createdAt,
            updatedAt: cuisine.updatedAt,
        };
    }
}