import { PlaceResource } from "./place.resource";

export class PlaceCollection {
  static toCollection(places: any[]) {
    return places.map((place) => PlaceResource.toResource(place));
  }

  static toCommonCollection(places: any[]) {
    return places.map((place) => ({
      id: place.id,
      name: place.name,
    }));
  }

  static withPagination(places: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(places.data),
      meta: places.meta,
    };
  }
}

