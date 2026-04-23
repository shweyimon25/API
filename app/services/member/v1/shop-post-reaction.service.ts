import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { ForbiddenException, NotFoundException } from "../../../helpers/exceptions";
import { CreateShopPostReactionInput } from "../../../schemas/member/v1/shop-post-reaction.schema";

const memberSelect = {
    id: true,
    name: true,
    email: true,
    code: true,
    profile: { select: { profilePhoto: true } },
};

const isShopPostWhere = {
    shopId: { not: null },
    shop: { status: Status.ACTIVE },
};

class ShopPostReactionService {
    async findAll(postId: string | number) {
        const reactions = await prisma.postReaction.findMany({
            where: {
                postId: +postId,
                post: isShopPostWhere,
            },
            include: { member: { select: memberSelect } },
            orderBy: { createdAt: "desc" },
        });
        return reactions;
    }

    async findOne(id: number) {
        const reaction = await prisma.postReaction.findFirst({
            where: {
                id,
                post: isShopPostWhere,
            },
            include: { member: { select: memberSelect } },
        });
        if (!reaction) {
            throw new NotFoundException("Shop post reaction not found");
        }
        return reaction;
    }

    async give(input: CreateShopPostReactionInput, memberId: number) {
        const { shopPostId } = input;

        const post = await prisma.post.findFirst({
            where: { id: shopPostId, ...isShopPostWhere },
        });
        if (!post) {
            throw new NotFoundException("Shop post not found");
        }

        const existing = await prisma.postReaction.findFirst({
            where: { postId: shopPostId, memberId },
        });
        if (existing) {
            await prisma.postReaction.delete({ where: { id: existing.id } });
            return null;
        }

        return prisma.postReaction.create({
            data: { postId: shopPostId, memberId },
            include: { member: { select: memberSelect } },
        });
    }

    async destroy(id: number, memberId: number) {
        const existing = await prisma.postReaction.findFirst({
            where: { id, post: isShopPostWhere },
        });
        if (!existing) {
            throw new NotFoundException("Shop post reaction not found");
        }
        if (existing.memberId !== memberId) {
            throw new ForbiddenException("You can only delete your own reaction");
        }
        await prisma.postReaction.delete({ where: { id } });
    }
}

export default ShopPostReactionService;
