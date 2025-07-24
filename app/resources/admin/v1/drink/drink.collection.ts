export class DrinkCollection {
    static toCollection(drinks: any[]) {
        return drinks.map((drink: any) => ({
            id: drink.id,
            name: drink.name,
            createdAt: drink.createdAt,
            updatedAt: drink.updatedAt,
        }));
    }

    static withPagination(drinks: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(drinks.data),
            meta: drinks.meta,
        };
    }
}
