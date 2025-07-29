import { TypeResource } from "../type/type.resource";

export class RestaurantCollection {
  static toCollection(restaurants: any[]) {
    return restaurants.map((restaurant: any) => ({
      id: restaurant.id,
      name: restaurant.name,
      profile: {
        logoUrl: restaurant.profile.logoUrl,
        bannerUrl: restaurant.profile.bannerUrl,
        phone: restaurant.profile.phone,
        address: restaurant.profile.address,
        lineId: restaurant.profile.lineId,
        facebookUrl: restaurant.profile.facebookUrl,
        coordinateLatitude: restaurant.profile.coordinateLatitude,
        coordinateLongitude: restaurant.profile.coordinateLongitude,
        preBookingPeriod: restaurant.profile.preBookingPeriod,
        openDays: restaurant.profile.openDays,
        openTime: restaurant.profile.openTime,
      },
      type: TypeResource.toResource(restaurant.type),
      status: restaurant.status,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    }));
  }

  static withPagination(restaurants: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(restaurants.data),
      meta: restaurants.meta,
    };
  }
}
