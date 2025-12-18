import { BodyAttentionAreaResource } from "./body-attention-area.resource";

export class BodyAttentionAreaCollection {
  static toCollection(res: any[]) {
    return res.map((bodyAttentionArea) =>
      BodyAttentionAreaResource.toResource(bodyAttentionArea)
    );
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

