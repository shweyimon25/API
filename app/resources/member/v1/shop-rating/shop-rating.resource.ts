export class ShopRatingResource {
    static toResource(rating: any) {
        return {
            id: rating.id,
            rate: rating.rate,
            review: rating.review,
            shop: rating.shop,
            member: rating.member,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        };
    }
}
