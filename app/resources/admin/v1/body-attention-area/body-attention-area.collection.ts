import { BodyAttentionAreaResource } from "./body-attention-area.resource";

export class BodyAttentionAreaCollection {
  static toCollection(res: any[]) {
    return res.map((bodyAttentionArea) =>
      BodyAttentionAreaResource.toResource(bodyAttentionArea)
    );
  }

  static toCommonCollection(bodyAttentionAreas: any[]) {
    return bodyAttentionAreas.map((bodyAttentionArea) => ({
      id: bodyAttentionArea.id,
      name: bodyAttentionArea.name,
    }));
  }

  static withPagination(res: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(res.data),
      meta: res.meta,
    };
  }
}

