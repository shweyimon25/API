import { MemberRequestStatus, ProviderType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { GymMemberRequestInput, TrainerMemberRequestInput } from "../../../schemas/member/v1/member-request.schema";
import { BadRequestException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { upload } from "../../../helpers/media-upload";

class MemberRequestService {
    async trainerMemberRequest(trainerMemberRequestInput: TrainerMemberRequestInput, files: Express.Multer.File[], userId: number) {
        const {
            memberPlanId,
            age,
            email,
            phone,
            yearOfExp,
            reason,
            gender,
        } = trainerMemberRequestInput;

        // Check member plan is existed
        const memberPlan = await prisma.memberPlan.findFirst({
            where: {
                id: memberPlanId,
                status: Status.ACTIVE,
                memberTypeId: 2
            },
            include: {
                memberType: true,
            }
        });

        if (!memberPlan) {
            throw new NotFoundException("Member plan not found");
        }

        // Check member is existed
        const member = await prisma.member.findUnique({
            where: {
                id: userId,
            },
            include: {
                providerTypes: true,
            }
        });

        if (!member) {
            throw new NotFoundException("Member not found");
        }

        if (member?.providerTypes.some(providerType => providerType.providerType === ProviderType.PHONE || providerType.providerType === ProviderType.APPLE || providerType.providerType === ProviderType.FACEBOOK)) {
            if (!email) {
                throw new ValidationException("Member request failed", [
                    {
                        field: "email",
                        issue: "Email is required",
                    },
                ]);
            }
        }

        if (member?.providerTypes.some(providerType => providerType.providerType === ProviderType.EMAIL || providerType.providerType === ProviderType.GOOGLE)) {
            if (!phone) {
                throw new ValidationException("Member request failed", [
                    {
                        field: "phone",
                        issue: "Phone is required",
                    },
                ]);
            }
        }

        // Upload trainer member photos 
        const photoFiles = files.filter((file: Express.Multer.File) => file.fieldname === "photos");
        const photos = await Promise.all(
            photoFiles.map(async (file: Express.Multer.File) => {
                const { fileUrl } = await upload(file, "trainer-member-photos");
                return fileUrl;
            })
        );

        if (photos.length === 0 || photos.length < 5) {
            throw new ValidationException("Member request failed", [
                {
                    field: "photos",
                    issue: "Photos are required and must be less than or equal to 5",
                },
            ]);
        }

        // Upload trainer member certificate
        const certificateFiles = files.filter((file: Express.Multer.File) => file.fieldname === "certificates");

        const certificates = await Promise.all(
            certificateFiles.map(async (file: Express.Multer.File) => {
                const { fileUrl } = await upload(file, "trainer-member-certificates");
                return fileUrl;
            })
        );

        // Member must be a trainer or a member with no member type
        const existingMember = await prisma.member.findFirst({
            where: {
                AND: [
                    {
                        id: userId,
                    },
                    {
                        OR: [
                            {
                                memberTypeId: null,
                            },
                            {
                                memberTypeId: 2,
                            },
                        ]
                    }
                ]
            },
            include: {
                profile: true,
                bodyMeasurement: true,
            }
        });

        if (existingMember?.memberTypeId === 1) {
            throw new BadRequestException("Cannot request to become a trainer because you are a gym member")
        }

        if (existingMember?.memberTypeId === 2) {
            throw new BadRequestException("Cannot request to become a trainer because you are already a trainer")
        }

        const existingTrainerMemberRequest = await prisma.memberRequest.findFirst({
            where: {
                memberId: userId,
                memberTypeId: 2,
            }
        });

        if (existingTrainerMemberRequest) {
            throw new BadRequestException("You have already requested")
        }

        const trainerMemberRequest = await prisma.memberRequest.create({
            data: {
                memberId: userId,
                memberTypeId: 2,
                memberPlanId,
                age,
                gender,
                yearOfExp,
                reason,
                certificates,
                photos,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true
                    }
                },
                memberType: true,
            }
        });

        return trainerMemberRequest;
    }

    async gymMemberRequest(gymMemberRequestInput: GymMemberRequestInput, userId: number) {
        const { memberPlanId } = gymMemberRequestInput;

        // Check member plan is existed
        const memberPlan = await prisma.memberPlan.findFirst({
            where: {
                id: memberPlanId,
                status: Status.ACTIVE,
                memberTypeId: 1
            },
            include: {
                memberType: true,
            }
        });

        if (!memberPlan) {
            throw new NotFoundException("Member plan not found");
        }

        // Check member is existed
        const member = await prisma.member.findUnique({
            where: {
                id: userId,
            },
            include: {
                providerTypes: true,
                memberType: true,
            }
        });

        if (member?.memberType?.name === "Gym Member") {
            throw new BadRequestException("Cannot request to become a gym member because you are already a gym member");
        }

        if (member?.memberType?.name === "Trainer Member") {
            throw new BadRequestException("Cannot request to become a gym member because you are a trainer");
        }

        const gymMemberRequest = await prisma.memberRequest.create({
            data: {
                memberId: userId,
                memberTypeId: 1,
                memberPlanId,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true
                    }
                },
                memberType: true,
                memberPlan: true,
            }
        });

        return gymMemberRequest;
    }
}

export default MemberRequestService;