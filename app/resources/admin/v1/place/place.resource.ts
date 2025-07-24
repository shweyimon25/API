export class PlaceResource {
    static toResource(place: any) {
        return {
            id: place.id,
            name: place.name,
            createdAt: place.createdAt,
            updatedAt: place.updatedAt,
        };
    }
}