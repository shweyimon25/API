export class ShopProfileResource {
  static toResource(shopProfile: any) {
    return {
      id: shopProfile.id,
      name: shopProfile.name,
      image: shopProfile.image,
      shopLevel: shopProfile.shopLevel,
      status: shopProfile.status,
      createdAt: shopProfile.createdAt,
      updatedAt: shopProfile.updatedAt,
    }
  }
}
