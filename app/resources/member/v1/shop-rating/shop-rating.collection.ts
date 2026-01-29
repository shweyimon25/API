import { ShopRatingResource } from "./shop-rating.resource";

export class ShopRatingCollection {
    static toCollection(ratings: any[]) {
        return ratings.map((r) => ShopRatingResource.toResource(r));
    }

    static withPagination(res: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(res.data),
            meta: res.meta,
        };
    }
}
