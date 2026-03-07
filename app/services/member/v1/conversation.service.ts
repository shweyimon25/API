import { ConversationStatus, ConversationType, ParticipantRole, Prisma, Status } from "@prisma/client";
import { CreateConversationInput, RequestAcceptConversationInput } from "../../../schemas/member/v1/conversation.schema";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";

class ConversationService {
    async findAll(memberId: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where,
            orderBy: {
                id: "desc"
            },
            include: {
                messages: {
                    select: {
                        id: true,
                        senderId: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                profile: {
                                    select: {
                                        profilePhoto: true
                                    }
                                }
                            }
                        },
                        readAt: true,
                        createdAt: true,
                    },
                    orderBy: {
                        id: "desc"
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        participants: true,
                    }
                },
            }
        });

        return conversations;
    }

    async findByPaginate(memberId: number, page: number, perPage: number, where: Prisma.ConversationWhereInput) {
        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                messages: {
                    select: {
                        id: true,
                        senderId: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                profile: {
                                    select: {
                                        profilePhoto: true
                                    }
                                }
                            }
                        },
                        readAt: true,
                        createdAt: true,
                    },
                    orderBy: {
                        id: "desc"
                    },
                    take: 1,
                },
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
                messages: {
                    select: {
                        id: true,
                        senderId: true,
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                profile: {
                                    select: {
                                        profilePhoto: true
                                    }
                                }
                            }
                        },
                        readAt: true,
                        createdAt: true,
                    },
                    orderBy: {
                        id: "desc"
                    },
                    take: 1,
                },
                bodyGoal: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                proficientLevel: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                memberPlan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        memberType: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                    }
                },
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

    async create(member: any, createConversationInput: CreateConversationInput, files: Express.Multer.File[]) {
        const { name, type, bodyGoalId, gender, proficiencLevelId: proficientLevelId, participantIds } = createConversationInput;

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

        // Create Social Group
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
                            not: member.id
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
                    memberId: member.id,
                    conversationId: conversation.id,
                    role: ParticipantRole.ADMIN
                }
            });
        }

        // Create Trainer Group
        if (type === ConversationType.TRAINER_GROUP) {

            // Check currenct member is tranier 
            const isTrainer = member.memberType.id === 2

            if (!isTrainer) {
                throw new BadRequestException("Only trainers can create trainer groups");
            }

            const existingBodyGoalId = await prisma.bodyGoal.findUnique({
                where: {
                    id: bodyGoalId
                }
            });

            if (!existingBodyGoalId) {
                throw new BadRequestException("Body goal does not exist");
            }

            const existingProficientLevel = await prisma.proficientLevel.findUnique({
                where: {
                    id: proficientLevelId
                }
            });

            if (!existingProficientLevel) {
                throw new BadRequestException("Proficient level does not exist");
            }

            conversation = await prisma.conversation.create({
                data: {
                    name,
                    type,
                    image: imageUrl,
                    bodyGoalId: bodyGoalId,
                    gender: gender,
                    proficientLevelId: proficientLevelId,
                    memberPlanId: member.memberType.memberPlans[0].id
                },
            });

            // Create participant for the creator
            await prisma.conversationParticipant.create({
                data: {
                    memberId: member.id,
                    conversationId: conversation.id,
                    role: ParticipantRole.ADMIN
                }
            });

            // Create participants for the conversation
            if (participantIds && participantIds.length > 0) {

                // Check participants exist
                const existingParticipants = await prisma.member.findMany({
                    where: {
                        id: {
                            in: participantIds,
                            not: member.id
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
        }

        return this.findOne(member.id, conversation.id);
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

    async requestAccept(id: number, requestAcceptConversationInput: RequestAcceptConversationInput, memberId: number) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                status: ConversationStatus.REQUESTED
            }
        });

        if (!conversation) {
            throw new NotFoundException("Conversation not found");
        }

        const currentMember = await prisma.member.findUnique({
            where: { id: memberId, status: Status.ACTIVE },
            include: { friends: true, friendsOf: true },
        });

        if (!currentMember) {
            throw new UnauthorizedException();
        }

        // Check if friend 
        const isFriend =
            currentMember.friends.some(f => f.friendId === memberId) ||
            currentMember.friendsOf.some(f => f.memberId === memberId);

        const firstMessage = await prisma.message.findFirst({
            where: { conversationId: conversation.id },
            orderBy: { id: "asc" },
            select: { senderId: true }
        });

        const shouldAcceptRequest =
            isFriend || !firstMessage || firstMessage.senderId !== memberId;

        if (!shouldAcceptRequest) {
            throw new BadRequestException(
                "Only the recipient can accept or cancel this conversation request."
            );
        }

        return await prisma.conversation.update({
            where: {
                id: conversation.id
            },
            data: {
                status: requestAcceptConversationInput.status
            }
        });
    }
}

export default ConversationService;