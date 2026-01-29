import prisma from "../../../../prisma/client";
import { BadRequestException, ForbiddenException, NotFoundException } from "../../../helpers/exceptions";
import { CreateShopPostCommentInput, UpdateShopPostCommentInput } from "../../../schemas/member/v1/shop-post-comment.schema";

const memberSelect = {
    id: true,
    name: true,
    email: true,
    code: true,
};

function mapComment(c: any): any {
    return {
        id: c.id,
        comment: c.comment,
        parentId: c.parentId,
        member: c.member ? { id: c.member.id, name: c.member.name, email: c.member.email, code: c.member.code } : null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        replies: (c.replies ?? []).map(mapComment),
    };
}

class ShopPostCommentService {
    async give(input: CreateShopPostCommentInput, memberId: number) {
        const { shopPostId, comment, parentId } = input;

        const post = await prisma.shopPost.findUnique({
            where: { id: shopPostId },
        });
        if (!post) {
            throw new NotFoundException("Shop post not found");
        }

        if (parentId != null) {
            const parent = await prisma.shopPostComment.findFirst({
                where: { id: parentId, shopPostId },
            });
            if (!parent) {
                throw new BadRequestException("Parent comment not found or does not belong to this post");
            }
        }

        const created = await prisma.shopPostComment.create({
            data: {
                shopPostId,
                memberId,
                comment,
                parentId: parentId ?? null,
            },
            include: {
                member: { select: memberSelect },
            },
        });

        const withReplies = await prisma.shopPostComment.findUnique({
            where: { id: created.id },
            include: {
                member: { select: memberSelect },
                replies: {
                    include: { member: { select: memberSelect } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });
        return withReplies!;
    }

    async findOne(id: number) {
        const comment = await prisma.shopPostComment.findUnique({
            where: { id },
            include: {
                member: { select: memberSelect },
                replies: {
                    include: { member: { select: memberSelect } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });
        if (!comment) {
            throw new NotFoundException("Shop post comment not found");
        }
        return comment;
    }

    async listByShopPostId(shopPostId: number) {
        const post = await prisma.shopPost.findUnique({
            where: { id: shopPostId },
        });
        if (!post) {
            throw new NotFoundException("Shop post not found");
        }

        const topLevel = await prisma.shopPostComment.findMany({
            where: { shopPostId, parentId: null },
            include: {
                member: { select: memberSelect },
                replies: {
                    include: { member: { select: memberSelect } },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return topLevel.map(mapComment);
    }

    async update(id: number, input: UpdateShopPostCommentInput, memberId: number) {
        const { comment } = input;
        const existing = await prisma.shopPostComment.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException("Shop post comment not found");
        }
        if (existing.memberId !== memberId) {
            throw new ForbiddenException("You can only update your own comments");
        }
        const updated = await prisma.shopPostComment.update({
            where: { id },
            data: { comment },
            include: {
                member: { select: memberSelect },
                replies: {
                    include: { member: { select: memberSelect } },
                    orderBy: { createdAt: "asc" },
                },
            },
        });
        return updated;
    }

    async destroy(id: number, memberId: number) {
        const existing = await prisma.shopPostComment.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException("Shop post comment not found");
        }
        if (existing.memberId !== memberId) {
            throw new ForbiddenException("You can only delete your own comments");
        }
        await prisma.shopPostComment.delete({
            where: { id },
        });
    }
}

export default ShopPostCommentService;
