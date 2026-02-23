import { ConversationType, ParticipantRole, Prisma, Conversation } from "@prisma/client";
import { CreateConversationInput } from "../../../schemas/member/v1/conversation.schema";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
class ConversationService {
    async findAll(memberId: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where,
            orderBy: {
                id: "desc"
            },
            include: {
                _count: {
                    select: {
                        participants: true,
                    }
                }
            }
        });

        return conversations;
    }

    async findByPaginate(memberId: number, page: number, perPage: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                _count: {
                    select: {
                        participants: true,
                    }
                }
            },
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy: {
                id: "desc"
            },
        });

        const totalConversations = await prisma.conversation.count({
            where: {
                ...where,
                participants: {
                    some: {
                        memberId
                    }
                }
            },
        });

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

    async findCommonAll(memberId: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where,
            orderBy: {
                id: "desc"
            },
        });

        return conversations;
    }

    async findOne(memberId: number, id: number) {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id,
                participants: {
                    some: {
                        memberId
                    }
                }
            },
            include: {
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
        });

        if (!conversation) {
            throw new NotFoundException("Conversation not found");
        }

        return conversation;
    }

    async create(memberId: number, createConversationInput: CreateConversationInput, files: Express.Multer.File[]) {
        const { name, type, participantIds } = createConversationInput;

        // Image Upload
        let imageUrl;

        if (files && files.length > 0) {
            const imageFile = files.filter(file => file.fieldname === "image");

            if (imageFile.length > 0) {
                const { fileUrl } = await upload(imageFile[0], "conversation-images");
                imageUrl = fileUrl;
            }
        }

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
                    image: imageUrl
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

    async update(memberId: number, id: number, updateConversationInput: CreateConversationInput, files: Express.Multer.File[]) {
        const { name, participantIds } = updateConversationInput;
        const conversation = await this.findOne(memberId, id);

        // Image Upload
        let imageUrl;

        if (files && files.length > 0) {
            const imageFile = files.filter(file => file.fieldname === "image");

            if (imageFile.length > 0) {
                const { fileUrl } = await upload(imageFile[0], "conversation-images");
                imageUrl = fileUrl;
            }
        }

        if (conversation.type === ConversationType.PRIVATE) {
            await prisma.conversation.update({
                where: { id },
                data: {
                    name: name ?? conversation.name,
                    image: imageUrl ?? conversation.image
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
                    } : undefined,
                    image: imageUrl ?? conversation.image
                },
            });
        }

        return await this.findOne(memberId, id);
    }

    async destroy(memberId: number, id: number) {
        const conversation = await this.findOne(memberId, id);

        if (conversation.participants.length > 0) {
            await prisma.conversationParticipant.deleteMany({
                where: {
                    conversationId: id
                }
            });
        }

        await prisma.conversation.delete({
            where: { id },
        });
    }
}

export default ConversationService;