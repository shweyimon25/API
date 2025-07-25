export class CuisineCollection {
    static toCollection(cuisines: any[]) {
        return cuisines.map((cuisine: any) => ({
            id: cuisine.id,
            name: cuisine.name,
            createdAt: cuisine.createdAt,
            updatedAt: cuisine.updatedAt,
        }));
    }

    static withPagination(cuisines: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(cuisines.data),
            meta: cuisines.meta,
        };
    }
}
