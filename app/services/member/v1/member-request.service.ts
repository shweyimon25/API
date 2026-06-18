import { MemberRequestStatus, ProviderType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { GymMemberRequestInput, TrainerMemberRequestInput } from "../../../schemas/member/v1/member-request.schema";
import { BadRequestException, NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { upload, uploadBase64Image } from "../../../helpers/media-upload";
import {
  parseRpcGender,
  parseRpcState,
  RpcTrainerRequestParams,
  trainerRequestInclude,
  buildBodyMeasurementData,
  isTrainerPhotoField,
  isTrainerCertificateField,
} from "../../../helpers/trainer-request.helper";

class MemberRequestService {
    private async createTrainerCore(
        params: RpcTrainerRequestParams,
        authMemberId: number,
        photoUrls: string[],
        certificateUrls: string[]
    ) {
        const memberId = Number(params.user_id);

        if (!Number.isInteger(memberId) || memberId <= 0) {
            throw new ValidationException("Failed to create trainer request", [
                { field: "user_id", issue: "User is required" },
            ]);
        }

        if (memberId !== authMemberId) {
            throw new ValidationException("Failed to create trainer request", [
                { field: "user_id", issue: "User does not match logged-in member" },
            ]);
        }

        if (!params.trainer_name?.trim()) {
            throw new ValidationException("Failed to create trainer request", [
                { field: "trainer_name", issue: "Trainer name is required" },
            ]);
        }

        const trainerMemberType = await prisma.memberType.findFirst({
            where: { name: "Trainer Member", status: Status.ACTIVE },
        });

        if (!trainerMemberType) {
            throw new BadRequestException("Trainer member type is not configured");
        }

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { profile: true, bodyMeasurement: true },
        });

        if (!member) {
            throw new NotFoundException("Member not found");
        }

        if (member.memberTypeId === 1) {
            throw new BadRequestException(
                "Cannot request to become a trainer because you are a gym member"
            );
        }

        if (member.memberTypeId === 2) {
            throw new BadRequestException(
                "Cannot request to become a trainer because you are already a trainer"
            );
        }

        const existingTrainerMemberRequest = await prisma.memberRequest.findFirst({
            where: {
                memberId,
                memberTypeId: trainerMemberType.id,
            },
        });

        if (existingTrainerMemberRequest) {
            throw new BadRequestException("You have already requested");
        }

        const memberPlan = params.member_plan_id
            ? await prisma.memberPlan.findFirst({
                  where: {
                      id: Number(params.member_plan_id),
                      status: Status.ACTIVE,
                      memberTypeId: trainerMemberType.id,
                  },
              })
            : await prisma.memberPlan.findFirst({
                  where: {
                      status: Status.ACTIVE,
                      memberTypeId: trainerMemberType.id,
                  },
                  orderBy: { id: "asc" },
              });

        if (!memberPlan) {
            throw new ValidationException("Failed to create trainer request", [
                { field: "member_plan_id", issue: "Trainer member plan is not found" },
            ]);
        }

        const status = parseRpcState(params.state);
        const gender = parseRpcGender(params.gender);

        await prisma.member.update({
            where: { id: memberId },
            data: {
                name: params.trainer_name,
                email: params.gmail ?? member.email,
                phone: params.phone ?? member.phone,
            },
        });

        const measurementData = buildBodyMeasurementData(params);

        if (member.bodyMeasurement) {
            await prisma.bodyMeasurement.update({
                where: { memberId },
                data: measurementData,
            });
        } else {
            await prisma.bodyMeasurement.create({
                data: {
                    memberId,
                    ...measurementData,
                },
            });
        }

        const trainerMemberRequest = await prisma.memberRequest.create({
            data: {
                memberId,
                memberTypeId: trainerMemberType.id,
                memberPlanId: memberPlan.id,
                age: Number(params.age),
                gender,
                yearOfExp: Number(params.year_of_experience),
                reason: params.join_purpose,
                certificates: [],
                photos: [],
                status,
                approvedAt:
                    status === MemberRequestStatus.APPROVED ? new Date() : null,
            },
        });

        const photos = photoUrls.map((url, index) => ({
            id: trainerMemberRequest.id + 77 + index,
            url,
        }));
        const certificates = certificateUrls.map((url, index) => ({
            id: memberId + 1 + index,
            url,
        }));

        return prisma.memberRequest.update({
            where: { id: trainerMemberRequest.id },
            data: {
                photos,
                certificates,
            },
            include: trainerRequestInclude,
        });
    }

    async createTrainerFromFormData(
        params: RpcTrainerRequestParams,
        files: Express.Multer.File[],
        authMemberId: number
    ) {
        const photoFiles = files.filter((file) => isTrainerPhotoField(file.fieldname));
        const certificateFiles = files.filter((file) =>
            isTrainerCertificateField(file.fieldname)
        );

        const photoUrls = await Promise.all(
            photoFiles.map(async (file) => {
                const { fileUrl } = await upload(file, "trainer-member-photos");
                return fileUrl;
            })
        );

        const certificateUrls = await Promise.all(
            certificateFiles.map(async (file) => {
                const { fileUrl } = await upload(file, "trainer-member-certificates");
                return fileUrl;
            })
        );

        if (photoUrls.length === 0) {
            throw new ValidationException("Failed to create trainer request", [
                {
                    field: "trainer_photo_line/photo",
                    issue: "At least one trainer photo is required",
                },
            ]);
        }

        return this.createTrainerCore(
            params,
            authMemberId,
            photoUrls,
            certificateUrls
        );
    }

    async createTrainerFromRpc(
        params: RpcTrainerRequestParams,
        authMemberId: number
    ) {
        const photoUploads = await Promise.all(
            (params.trainer_photo_line ?? []).map((line) =>
                uploadBase64Image(line.photo ?? "", "trainer-member-photos")
            )
        );
        const photoUrls = photoUploads.filter((url): url is string => !!url);

        const certificateUpload = await uploadBase64Image(
            params.certificate ?? "",
            "trainer-member-certificates"
        );
        const certificateUrls = certificateUpload ? [certificateUpload] : [];

        return this.createTrainerCore(
            params,
            authMemberId,
            photoUrls,
            certificateUrls
        );
    }

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