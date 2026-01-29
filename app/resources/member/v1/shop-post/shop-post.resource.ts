export class ShopPostResource {
    static toResource(shopPost: any) {
        return {
            id: shopPost.id,
            caption: shopPost.caption,
            images: shopPost.images,
            shop: {
                id: shopPost.shop.id,
                name: shopPost.shop.name,
                logo: shopPost.shop.logo,
                member: {
                    id: shopPost.shop.member.id,
                    name: shopPost.shop.member.name,
                    email: shopPost.shop.member.email,
                    code: shopPost.shop.member.code,
                },
            },
            createdAt: shopPost.createdAt,
            updatedAt: shopPost.updatedAt,
        }
    }
}
