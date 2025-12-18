import { WaterTrackerResource } from "./water-tracker.resource";

export class WaterTrackerCollection {
  static toCollection(res: any[]) {
    return res.map((waterTracker) =>
      WaterTrackerResource.toResource(waterTracker)
    );
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

