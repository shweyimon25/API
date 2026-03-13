export class BlockResource {
  static toResource(block: any) {
    return {
      id: block.id,
      memberId: block.memberId,
      blockedMemberId: block.blockedMemberId,
      blockedMember: block.blockedMember,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    };
  }
}
