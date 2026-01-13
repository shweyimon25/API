import { PhysicalLimitationResource } from "./physical-limitation.resource";

export class PhysicalLimitationCollection {
  static toCollection(res: any[]) {
    return res.map((physicalLimitation) =>
      PhysicalLimitationResource.toResource(physicalLimitation)
    );
  }

  static toCommonCollection(physicalLimitations: any[]) {
    return physicalLimitations.map((physicalLimitation) => ({
      id: physicalLimitation.id,
      name: physicalLimitation.name,
    }));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

