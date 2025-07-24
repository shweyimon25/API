export class DrinkResource {
    static toResource(drink: any) {
        return {
            id: drink.id,
            name: drink.name,
            createdAt: drink.createdAt,
            updatedAt: drink.updatedAt,
        };
    }
}