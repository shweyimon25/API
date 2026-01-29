function toCommentNode(c: any): any {
    return {
        id: c.id,
        comment: c.comment,
        parentId: c.parentId,
        member: c.member
            ? { id: c.member.id, name: c.member.name, email: c.member.email, code: c.member.code }
            : null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        replies: (c.replies ?? []).map(toCommentNode),
    };
}

export class ShopPostCommentResource {
    static toResource(comment: any) {
        return toCommentNode(comment);
    }
}
