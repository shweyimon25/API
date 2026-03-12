import { ConversationStatus, ConversationType, ParticipantRole, Prisma, Status } from "@prisma/client";
import { AddParticipantsInput, CreateConversationInput, RequestAcceptConversationInput, UpdateParticipantRoleInput } from "../../../schemas/member/v1/conversation.schema";
import prisma from "../../../../prisma/client";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";
import ProfileService from "./profile.service";

class ConversationService {
    private profileService: ProfileService;

    constructor() {
        this.profileService = new ProfileService();
    }

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
                id
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

    async create(memberId: number, createConversationInput: CreateConversationInput, files: Express.Multer.File[]) {
        const currentMember = await this.profileService.profile(memberId);
        const { name, type, bodyGoalId, gender, proficiencLevelId: proficientLevelId } = createConversationInput;

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

        // Create Social Group (no participants auto-added)
        if (type === ConversationType.GROUP) {

            conversation = await prisma.conversation.create({
                data: {
                    name,
                    type,
                    image: imageUrl
                },
            });

            await prisma.conversationParticipant.create({
                data: {
                    memberId,
                    conversationId: conversation.id,
                    role: ParticipantRole.ADMIN,
                },
            });
        }

        // Create Trainer Group (no participants auto-added)
        if (type === ConversationType.TRAINER_GROUP) {

            const isTrainer = currentMember?.memberType?.id === 2;

            if (!isTrainer) {
                throw new BadRequestException("Only trainers can create trainer groups");
            }

            const existingBodyGoalId = await prisma.bodyGoal.findFirst({
                where: {
                    id: bodyGoalId,
                    status: Status.ACTIVE
                }
            });

            if (!existingBodyGoalId) {
                throw new BadRequestException("Body goal does not exist");
            }

            const existingProficientLevel = await prisma.proficientLevel.findFirst({
                where: {
                    id: proficientLevelId,
                    status: Status.ACTIVE
                }
            });

            if (!existingProficientLevel) {
                throw new BadRequestException("Proficient level does not exist");
            }

            const memberPlanId = currentMember?.memberType?.memberPlans?.[0]?.id;

            if (!memberPlanId) {
                throw new BadRequestException("Trainer has no active member plan");
            }

            conversation = await prisma.conversation.create({
                data: {
                    name,
                    type,
                    image: imageUrl,
                    bodyGoalId: bodyGoalId,
                    gender: gender,
                    proficientLevelId: proficientLevelId,
                    memberPlanId,
                },
            });

            await prisma.conversationParticipant.create({
                data: {
                    memberId,
                    conversationId: conversation.id,
                    role: ParticipantRole.ADMIN,
                },
            });
        }

        return await this.findOne(memberId, conversation.id);
    }

    async update(memberId: number, id: number, updateConversationInput: CreateConversationInput, files: Express.Multer.File[]) {
        const { name } = updateConversationInput;
        const conversation = await this.findOne(memberId, id);

        const currentParticipant = conversation.participants.find(
            (p) => p.memberId === memberId,
        );

        if (!currentParticipant) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        if (currentParticipant.role !== ParticipantRole.ADMIN) {
            throw new ForbiddenException("Only conversation admins can update the conversation");
        }

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
            await prisma.conversation.update({
                where: { id },
                data: {
                    name: name ?? conversation.name,
                    image: imageUrl ?? conversation.image
                },
            });
        }

        return await this.findOne(memberId, id);
    }

    async addedParticipants(memberId: number, id: number, addParticipantsInput: AddParticipantsInput) {
        const { participantId } = addParticipantsInput;

        if (participantId === memberId) {
            throw new BadRequestException("You cannot add yourself as a participant");
        }

        const conversation = await this.findOne(memberId, id);

        let currentParticipant = conversation.participants.find(
            (p) => p.memberId === memberId,
        );

        if (!currentParticipant) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        // GROUP: any participant can add others
        // TRAINER_GROUP: only admins can add and must be a trainer
        if (conversation.type === ConversationType.TRAINER_GROUP) {
            if (currentParticipant.role !== ParticipantRole.ADMIN) {
                throw new BadRequestException("Only conversation admins can add participants");
            }

            const isTrainer = currentParticipant.memberId === memberId && (await prisma.member.findFirst({
                where: { id: memberId, status: Status.ACTIVE },
                select: { memberTypeId: true, memberType: { select: { id: true } } },
            }))?.memberType?.id === 2;

            if (!isTrainer) {
                throw new BadRequestException("Only trainers can add participants to trainer groups");
            }
        }

        // Exclude current member and already-added participants
        const existingIds = new Set(conversation.participants.map((p) => p.memberId));

        if (existingIds.has(participantId)) {
            throw new BadRequestException("Participant is already in this conversation");
        }

        // Ensure all target members exist
        const existingMembers = await prisma.member.findMany({
            where: {
                id: participantId,
            },
            select: {
                id: true,
                status: true,
                bodyGoalId: true,
                proficientLevelId: true,
                profile: { select: { gender: true } },
                memberType: { select: { memberPlans: { select: { id: true } } } },
            }
        });

        if (existingMembers.length === 0) {
            throw new BadRequestException("Participant does not exist");
        }

        // Check if the participants match the trainer group filters
        if (conversation.type === ConversationType.TRAINER_GROUP) {
            const requiredPlanId = conversation.memberPlanId;
            const requiredGender = conversation.gender;
            const requiredBodyGoalId = conversation.bodyGoalId;
            const requiredProficientLevelId = conversation.proficientLevelId;

            if (!requiredPlanId || !requiredGender || !requiredBodyGoalId || !requiredProficientLevelId) {
                throw new BadRequestException("Trainer group is missing required filters");
            }

            for (const m of existingMembers) {
                if (m.status !== Status.ACTIVE) {
                    throw new BadRequestException(`Participant ${m.id} is not active`);
                }

                const memberGender = m.profile?.gender ?? null;
                const genderOk =
                    requiredGender === "BOTH" ||
                    memberGender === requiredGender ||
                    memberGender === "BOTH";

                if (!genderOk) {
                    throw new BadRequestException(
                        `Participant ${m.id} gender does not match this trainer group`,
                    );
                }

                const planIds = m.memberType?.memberPlans?.map((p) => p.id) ?? [];
                const planOk = planIds.includes(requiredPlanId);

                if (!planOk) {
                    throw new BadRequestException(
                        `Participant ${m.id} does not match this trainer group's member plan`,
                    );
                }

                const bodyGoalOk = m.bodyGoalId === requiredBodyGoalId;
                if (!bodyGoalOk) {
                    throw new BadRequestException(
                        `Participant ${m.id} does not match this trainer group's body goal`,
                    );
                }

                const proficientOk = m.proficientLevelId === requiredProficientLevelId;
                if (!proficientOk) {
                    throw new BadRequestException(
                        `Participant ${m.id} does not match this trainer group's proficient level`,
                    );
                }
            }
        }

        await prisma.conversationParticipant.create({
            data: {
                memberId: participantId,
                conversationId: id,
                role: ParticipantRole.MEMBER,
            },
        });

        return this.findOne(memberId, id);
    }

    async removeParticipant(memberId: number, id: number, participantId: number) {
        const conversation = await this.findOne(memberId, id);

        const currentParticipant = conversation.participants.find(
            (p) => p.memberId === memberId,
        );

        if (!currentParticipant) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        if (currentParticipant.role !== ParticipantRole.ADMIN) {
            throw new ForbiddenException("Only conversation admins can remove participants");
        }

        const participant = conversation.participants.find((p) => p.memberId === participantId);

        if (!participant) {
            throw new BadRequestException("Participant not found");
        }

        if (participantId === memberId) {
            throw new BadRequestException("You cannot remove yourself");
        }

        await prisma.conversationParticipant.delete({
            where: {
                conversationId_memberId: {
                    conversationId: id,
                    memberId: participantId,
                },
            },
        });

        return this.findOne(memberId, id);
    }

    async leave(memberId: number, id: number) {
        const conversation = await this.findOne(memberId, id);
        const currentParticipant = conversation.participants.find(
            (p) => p.memberId === memberId,
        );

        if (!currentParticipant) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        if (currentParticipant.role === ParticipantRole.ADMIN) {
            const otherAdminExists = conversation.participants.some(
                (p) => p.role === ParticipantRole.ADMIN && p.memberId !== memberId,
            );

            if (!otherAdminExists) {
                throw new BadRequestException(
                    "You cannot leave as the only admin. Assign another admin first.",
                );
            }
        }

        await prisma.conversationParticipant.delete({
            where: {
                conversationId_memberId: {
                    conversationId: id,
                    memberId: memberId,
                },
            },
        });

        return this.findOne(memberId, id);
    }

    async destroy(memberId: number, id: number) {
        const conversation = await this.findOne(memberId, id);

        const currentParticipant = conversation.participants.find(
            (p) => p.memberId === memberId,
        );

        if (!currentParticipant) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        if (currentParticipant.role !== ParticipantRole.ADMIN) {
            throw new ForbiddenException("Only conversation admins can delete the conversation");
        }

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

    async updateParticipantRole(memberId: number, id: number, participantId: number, updateParticipantRoleInput: UpdateParticipantRoleInput) {
        const conversation = await this.findOne(memberId, id);
        const currentParticipant = conversation.participants.find(
            (p) => p.memberId === memberId,
        );

        if (!currentParticipant) {
            throw new BadRequestException("You are not a participant of this conversation");
        }

        if (currentParticipant.role !== ParticipantRole.ADMIN) {
            throw new ForbiddenException("Only conversation admins can update participant role");
        }

        const participant = conversation.participants.find((p) => p.memberId === participantId);

        if (!participant) {
            throw new BadRequestException("Participant not found");
        }

        if (participantId === memberId) {
            throw new BadRequestException("You cannot update your own role");
        }

        await prisma.conversationParticipant.update({
            where: {
                conversationId_memberId: {
                    conversationId: id,
                    memberId: participantId,
                },
            },
            data: {
                role: updateParticipantRoleInput.role
            },
        });

        return this.findOne(memberId, id);
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

        await prisma.conversation.update({
            where: {
                id: conversation.id
            },
            data: {
                status: requestAcceptConversationInput.status
            }
        });

        return await this.findOne(memberId, conversation.id);
    }
}

export default ConversationService;