export class ShopLevelResource {
  static toResource(shopLevel: any) {
    return {
      id: shopLevel.id,
      name: shopLevel.name,
      price: shopLevel.price,
      duration: shopLevel.duration,
      description: shopLevel.description,
      postLimit: shopLevel.postLimit,
      status: shopLevel.status,
      createdBy: shopLevel.createdBy,
      updatedBy: shopLevel.updatedBy,
      createdAt: shopLevel.createdAt,
      updatedAt: shopLevel.updatedAt,
    }
  }
}

