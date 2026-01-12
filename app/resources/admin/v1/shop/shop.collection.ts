export class ShopCollection {
  static toCollection(shops: any[]) {
    return shops;
  }

  static toCommonCollection(shops: any[]) {
    return shops.map((shop: any) => ({
      id: shop.id,
      name: shop.name,
    }));
  }

  static withPagination(shops: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(shops.data),
      meta: shops.meta,
    };
  }
}
