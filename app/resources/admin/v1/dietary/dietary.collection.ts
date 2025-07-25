export class DietaryCollection {
    static toCollection(dietaries: any[]) {
        return dietaries.map((dietary: any) => ({
            id: dietary.id,
            name: dietary.name,
            createdAt: dietary.createdAt,
            updatedAt: dietary.updatedAt,
        }));
    }

    static withPagination(dietaries: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(dietaries.data),
            meta: dietaries.meta,
        };
    }
}
