export class ShopPostReactionResource {
    static toResource(r: any) {
        return {
            id: r.id,
            member: r.member
                ? {
                      id: r.member.id,
                      name: r.member.name,
                      email: r.member.email,
                      code: r.member.code,
                      profile: r.member.profile ?? null,
                  }
                : null,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        };
    }
}
