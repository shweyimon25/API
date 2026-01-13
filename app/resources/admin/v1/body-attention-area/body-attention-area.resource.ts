export class BodyAttentionAreaResource {
  static toResource(bodyAttentionArea: any) {
    return {
      id: bodyAttentionArea.id,
      name: bodyAttentionArea.name,
      status: bodyAttentionArea.status,
      createdBy: bodyAttentionArea.createdBy,
      updatedBy: bodyAttentionArea.updatedBy,
      createdAt: bodyAttentionArea.createdAt,
      updatedAt: bodyAttentionArea.updatedAt,
    };
  }
}

