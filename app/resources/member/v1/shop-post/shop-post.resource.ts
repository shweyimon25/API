export class ShopPostResource {
    static toResource(shopPost: any) {
        return {
            id: shopPost.id,
            caption: shopPost.caption,
            images: shopPost.images,
            shop: shopPost.shop ?? null,
            viewCount: shopPost.viewCount ?? 0,
            createdAt: shopPost.createdAt,
            updatedAt: shopPost.updatedAt,
        };
    }
}
