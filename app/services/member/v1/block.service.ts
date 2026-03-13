import prisma from "../../../../prisma/client";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../../helpers/exceptions";
import { BlockInput } from "../../../schemas/member/v1/block.schema";

class BlockService {
    async findAll(memberId: number) {
        const blocks = await prisma.block.findMany({
            where: {
                memberId,
            },
            include: {
                blockedMember: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            },
                        },
                    },
                },
            },
        });

        return blocks;
    }

    async findByPaginate(memberId: number, page: number, perPage: number) {
        const blocks = await prisma.block.findMany({
            where: {
                memberId,
            },
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                blockedMember: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            },
                        },
                    },
                },
            }
        });

        const totalBlocks = await prisma.block.count({
            where: {
                memberId,
            },
        });

        return {
            data: blocks,
            meta: {
                totalCount: totalBlocks,
                totalPages: Math.ceil(totalBlocks / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalBlocks / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalBlocks / perPage),
            },
        };
    }

    async findCommonAll(memberId: number) {
        const blocks = await prisma.block.findMany({
            where: {
                memberId,
            },
            select: {
                id: true,
                blockedMemberId: true,
                blockedMember: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            },
                        },
                    },
                },
            }
        });

        return blocks;
    }

    async findOne(id: number, memberId: number) {
        const block = await prisma.block.findUnique({
            where: {
                id,
                memberId: memberId,
            },
            include: {
                blockedMember: {
                    select: {
                        id: true,
                        code: true,
                        email: true,
                        phone: true,
                        profile: {
                            select: {
                                profilePhoto: true,
                            },
                        },
                    },
                },
            },
        });

        if (!block) {
            throw new NotFoundException("Block not found");
        }

        return block;
    }

    async block(memberId: number, createBlockInput: BlockInput) {
        const { memberId: blockedMemberId } = createBlockInput;

        const existingBlock = await prisma.block.findFirst({
            where: {
                AND: [
                    { memberId: memberId },
                    { blockedMemberId: blockedMemberId },
                ],
            },
        })

        if (existingBlock) {
            throw new BadRequestException("You have already blocked this member");
        }

        const block = await prisma.block.create({
            data: {
                memberId: memberId,
                blockedMemberId: blockedMemberId,
            },
        })

        return this.findOne(block.id, memberId);
    }

    async unblock(id: number, memberId: number) {
        const existingBlock = await prisma.block.findFirst({
            where: {
                id: id,
            },
        });

        if (!existingBlock) {
            throw new NotFoundException("Block not found");
        }

        if (existingBlock.memberId !== memberId) {
            throw new ForbiddenException("Can't unblock other member's blocks");
        }

        await prisma.block.delete({
            where: {
                id: id,
            },
        });
    }
}

export default BlockService;