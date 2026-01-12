export class ShopLevelCollection {
  static toCollection(shopLevels: any[]) {
    return shopLevels.map((shopLevel) => ({
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
    }));
  }


  static toCommonCollection(shopLevels: any[]) {
    return shopLevels.map((shopLevel) => ({
      id: shopLevel.id,
      name: shopLevel.name,
    }));
  }


  static withPagination(shopLevels: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(shopLevels.data),
      meta: shopLevels.meta,
    };
  }
}

