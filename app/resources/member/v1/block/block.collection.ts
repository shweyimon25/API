import { BlockResource } from "./block.resource";

export class BlockCollection {
  static toCollection(blocks: any[]) {
    return blocks.map((block) =>
      BlockResource.toResource(block)
    );
  }

  static toCommonCollection(blocks: any[]) {
    return blocks.map((block) => ({
      id: block.id,
      memberId: block.memberId,
      blockedMemberId: block.blockedMemberId,
      blockedMember: block.blockedMember
    }));
  }

  static withPagination(blocks: { data: any[]; meta: any }) {
    return {
      data: this.toCollection(blocks.data),
      meta: blocks.meta,
    };
  }
}
