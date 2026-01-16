export class ShopLevelRequestCollection {
  static toCollection(shopUpgradeRequests: any[]) {
    return shopUpgradeRequests.map((shopUpgradeRequest) => {
      return shopUpgradeRequest;
    });
  }

  static withPagination(shopUpgradeRequests: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(shopUpgradeRequests.data),
      meta: shopUpgradeRequests.meta,
    };
  }
}
