export class PlaceCollection {
    static toCollection(places: any[]) {
        return places.map((place: any) => ({
            id: place.id,
            name: place.name,
            createdAt: place.createdAt,
            updatedAt: place.updatedAt,
        }));
    }

    static withPagination(places: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(places.data),
            meta: places.meta,
        };
    }
}
