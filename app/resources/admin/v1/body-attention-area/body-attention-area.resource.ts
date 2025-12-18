export class BodyAttentionAreaResource {
  static toResource(bodyAttentionArea: any) {
    return {
      id: bodyAttentionArea.id,
      name: bodyAttentionArea.name,
      status: bodyAttentionArea.status,
      createdBy: bodyAttentionArea.createdBy
        ? {
            id: bodyAttentionArea.createdBy.id,
            name: bodyAttentionArea.createdBy.name,
            email: bodyAttentionArea.createdBy.email,
            username: bodyAttentionArea.createdBy.username,
          }
        : null,
      updatedBy: bodyAttentionArea.updatedBy
        ? {
            id: bodyAttentionArea.updatedBy.id,
            name: bodyAttentionArea.updatedBy.name,
            email: bodyAttentionArea.updatedBy.email,
            username: bodyAttentionArea.updatedBy.username,
          }
        : null,
      createdAt: bodyAttentionArea.createdAt,
      updatedAt: bodyAttentionArea.updatedAt,
    };
  }
}

