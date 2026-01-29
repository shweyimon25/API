import {
  generateTimeAgo,
  getMemberDisplayImage,
} from "../../../../helpers/helper";

export class PostResource {
  static toResource(post: any) {
    const member = post.member
      ? {
          ...post.member,
          image: getMemberDisplayImage(post.member),
        }
      : null;

    return {
      id: post.id,
      content: post.content,
      tag: post.tag ?? null,
      privencyType: post.privencyType,
      member,
      timeAgo: generateTimeAgo(post.createdAt ?? post.timeAgo ?? new Date()),
      media: post.media ?? [],
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      ...(post.postComments && {
        postComments: post.postComments.map((c: any) => ({
          id: c.id,
          member: c.member ?? null,
          comment: c.comment,
          parentId: c.parentId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      }),
    };
  }
}
