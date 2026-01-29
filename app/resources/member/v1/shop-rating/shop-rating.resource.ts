export class ShopRatingResource {
    static toResource(rating: any) {
        return {
            id: rating.id,
            rate: rating.rate,
            review: rating.review,
            shop: rating.shop
                ? {
                    id: rating.shop.id,
                    name: rating.shop.name,
                    image: rating.shop.image,
                }
                : null,
            member: rating.member
                ? {
                    id: rating.member.id,
                    name: rating.member.name,
                    email: rating.member.email,
                    code: rating.member.code,
                }
                : null,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        };
    }
}
