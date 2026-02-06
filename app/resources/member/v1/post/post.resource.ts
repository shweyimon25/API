import {
  generateTimeAgo
} from "../../../../helpers/helper";

export class PostResource {
  static toResource(post: any) {
    return {
      id: post.id,
      content: post.content,
      tag: post.tag ?? null,
      privencyType: post.privencyType,
      member: post.member,
      timeAgo: generateTimeAgo(post.createdAt ?? post.timeAgo ?? new Date()),
      media: post.media ?? [],
      viewCount: post.viewCount ?? 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
