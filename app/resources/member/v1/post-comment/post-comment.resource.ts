function toCommentNode(c: any): any {
  const member = c.member
    ? {
        id: c.member.id,
        name: c.member.name,
        email: c.member.email,
        code: c.member.code,
        profile: c.member.profile ?? null,
      }
    : null;

  const reactions = (c.postCommentReactions ?? []).map((r: any) => ({
    memberId: r.memberId,
    reaction: r.reaction,
  }));

  return {
    id: c.id,
    comment: c.comment,
    parentId: c.parentId,
    member,
    reactions,
    reactionsCount: reactions.length,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    replies: (c.replies ?? []).map(toCommentNode),
  };
}

export class PostCommentResource {
  static toResource(comment: any) {
    return toCommentNode(comment);
  }
}
