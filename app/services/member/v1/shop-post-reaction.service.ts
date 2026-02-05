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

class ShopPostReactionService {
    async findAll(shopPostId: string | number) {
        const reactions = await prisma.shopPostReaction.findMany({
            where: { shopPostId: +shopPostId },
            include: { member: { select: memberSelect } },
            orderBy: { createdAt: "desc" },
        });
        return reactions;
    }

    async findOne(id: number) {
        const reaction = await prisma.shopPostReaction.findUnique({
            where: { id },
            include: { member: { select: memberSelect } },
        });
        if (!reaction) {
            throw new NotFoundException("Shop post reaction not found");
        }
        return reaction;
    }

    async give(input: CreateShopPostReactionInput, memberId: number) {
        const { shopPostId } = input;

        const post = await prisma.shopPost.findUnique({ where: { id: shopPostId } });
        if (!post) {
            throw new NotFoundException("Shop post not found");
        }

        const existing = await prisma.shopPostReaction.findFirst({ where: { shopPostId, memberId } });
        if (existing) {
            // Toggle: if exists, delete it (remove heart)
            await prisma.shopPostReaction.delete({ where: { id: existing.id } });
            return null;
        }

        // Create reaction (add heart)
        const created = await prisma.shopPostReaction.create({
            data: { shopPostId, memberId },
            include: { member: { select: memberSelect } },
        });
        return created;
    }

    async destroy(id: number, memberId: number) {
        const existing = await prisma.shopPostReaction.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException("Shop post reaction not found");
        }
        if (existing.memberId !== memberId) {
            throw new ForbiddenException("You can only delete your own reaction");
        }
        await prisma.shopPostReaction.delete({ where: { id } });
    }
}

export default ShopPostReactionService;
