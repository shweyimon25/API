export class TagResource {
  static toResource(tag: any) {
    return {
      id: tag.id,
      name: tag.name,
      createdBy: tag.createdBy
        ? {
            id: tag.createdBy.id,
            name: tag.createdBy.name,
            email: tag.createdBy.email,
            username: tag.createdBy.username,
          }
        : null,
      updatedBy: tag.updatedBy
        ? {
            id: tag.updatedBy.id,
            name: tag.updatedBy.name,
            email: tag.updatedBy.email,
            username: tag.updatedBy.username,
          }
        : null,
      postsCount: tag._count?.posts || 0,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}

