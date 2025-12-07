export class PostResource {
  static toResource(post: any) {
    return {
      id: post.id,
      contact: post.contact,
      tag: post.tag
        ? {
            id: post.tag.id,
            name: post.tag.name,
          }
        : null,
      privencyType: post.privencyType,
      media: post.media,
      commentsCount: post._count?.postComments || 0,
      comments: post.postComments
        ? post.postComments.map((comment: any) => ({
            id: comment.id,
            member: comment.member
              ? {
                  id: comment.member.id,
                  name: comment.member.name,
                  email: comment.member.email,
                  username: comment.member.username,
                }
              : null,
            comment: comment.comment,
            parentId: comment.parentId,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          }))
        : [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}

