import { ShopPostResource } from "./shop-post.resource";

export class ShopPostCollection {
    static toCollection(res: any[]) {
        return res.map((shopPost) => ShopPostResource.toResource(shopPost));
    }

    static withPagination(res: { data: any[]; meta: any }) {
        return {
            data: this.toCollection(res.data),
            meta: res.meta,
        };
    }
}

