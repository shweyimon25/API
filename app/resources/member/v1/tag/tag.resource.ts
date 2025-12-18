export class TagResource {
  static toResource(tag: any) {
    return {
      id: tag.id,
      name: tag.name,
      status: tag.status,
      postsCount: tag._count?.posts || 0,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}

