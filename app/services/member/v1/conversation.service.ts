import { ConversationType, ParticipantRole, Prisma, Conversation } from "@prisma/client";
import { CreateConversationInput } from "../../../schemas/member/v1/conversation.schema";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException, ValidationException } from "../../../helpers/exceptions";

const conversationSelect = {
    participants: {
        include: {
            member: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: {
                        select: {
                            profilePhoto: true
                        }
                    }
                },
            },
        },
    },
}

class ConversationService {
    async findAll(memberId: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where: {
                ...where,
                participants: {
                    some: {
                        memberId
                    }
                }
            },
            orderBy: {
                id: "desc"
            },
            include: conversationSelect
        });

        return conversations;
    }

    async findByPaginate(memberId: number, page: number, perPage: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where: {
                ...where,
                participants: {
                    some: {
                        memberId
                    }
                }
            },
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {
                id: "desc"
            },
            include: conversationSelect
        });

        const totalConversations = await prisma.conversation.count();

        return {
            data: conversations,
            meta: {
                totalCount: totalConversations,
                totalPages: Math.ceil(totalConversations / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalConversations / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalConversations / perPage),
            },
        };
    }

    async findOne(memberId: number, id: number) {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id,
            },
            include: conversationSelect
        });

        console.log(conversation?.participants)

        if (!conversation) {
            throw new NotFoundException("Conversation not found");
        }

        return conversation;
    }

    async create(memberId: number, createConversationInput: CreateConversationInput) {
        const { name, type, participantIds } = createConversationInput;

        let conversation: any;

        if (type === ConversationType.PRIVATE) {
            conversation = await prisma.conversation.create({
                data: {
                    name,
                    type,
                },
            });
        }

        if (type === ConversationType.GROUP) {

            // Create conversation with participants
            conversation = await prisma.conversation.create({
                data: {
                    name,
                    type,
                },
            });

            // Create participants for the conversation
            if (participantIds && participantIds.length > 0) {

                // Check participants exist
                const existingParticipants = await prisma.member.findMany({
                    where: {
                        id: {
                            in: participantIds,
                            not: memberId
                        }
                    }
                });

                if (existingParticipants.length !== participantIds.length) {
                    throw new BadRequestException("One or more participants do not exist");
                }

                await prisma.conversationParticipant.createMany({
                    data: participantIds.map(pid => ({
                        memberId: pid,
                        conversationId: conversation.id,
                        role: ParticipantRole.MEMBER
                    }))
                });
            }

            // Create participant for the creator
            await prisma.conversationParticipant.create({
                data: {
                    memberId,
                    conversationId: conversation.id,
                    role: ParticipantRole.ADMIN
                }
            });
        }

        return conversation;
    }

    async update(memberId: number, id: number, updateConversationInput: CreateConversationInput) {
        const { name, participantIds } = updateConversationInput;

        const conversation = await this.findOne(memberId, id);

        if (conversation.type === ConversationType.PRIVATE) {
            await prisma.conversation.update({
                where: { id },
                data: {
                    name: name ?? conversation.name,
                },
            });
        }

        if (conversation.type === ConversationType.GROUP) {
            // Check participants exist 
            if (participantIds && participantIds.length > 0) {
                const existingParticipants = await prisma.member.findMany({
                    where: {
                        id: {
                            in: participantIds,
                            not: memberId
                        }
                    }
                });

                if (existingParticipants.length !== participantIds.length) {
                    throw new BadRequestException("One or more participants do not exist");
                }
            }

            await prisma.conversation.update({
                where: { id },
                data: {
                    name: name ?? conversation.name,
                    participants: participantIds ? {
                        deleteMany: {},
                        create: participantIds.map(pid => ({ memberId: pid }))
                    } : undefined
                },
            });
        }

        return await this.findOne(memberId, id);
    }

    async destroy(memberId: number, id: number) {
        await this.findOne(memberId, id);

        await prisma.conversation.delete({
            where: { id },
        });
    }
}

export default ConversationService;