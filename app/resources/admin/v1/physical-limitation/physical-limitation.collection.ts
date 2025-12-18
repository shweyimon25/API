import { PhysicalLimitationResource } from "./physical-limitation.resource";

export class PhysicalLimitationCollection {
  static toCollection(res: any[]) {
    return res.map((physicalLimitation) =>
      PhysicalLimitationResource.toResource(physicalLimitation)
    );
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

