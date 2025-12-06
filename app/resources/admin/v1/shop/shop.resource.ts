export class ShopResource {
  static toResource(shop: any) {
    return {
      id: shop.id,
      name: shop.name,
      image: shop.image,
      status: shop.status,
      member: shop.member
        ? {
            id: shop.member.id,
            name: shop.member.name,
            email: shop.member.email,
            username: shop.member.username,
          }
        : null,
      shopLevel: shop.shopLevel
        ? {
            id: shop.shopLevel.id,
            name: shop.shopLevel.name,
            price: shop.shopLevel.price,
            duration: shop.shopLevel.duration,
          }
        : null,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    };
  }
}
