import { Member } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { comparePassword, hashPassword } from "../../../helpers/helper";
import { UpdateBodyMeasurementsInput } from "../../../schemas/member/v1/auth.schema";
import { ChangePasswordInput, UpdateProfileInput } from "../../../schemas/member/v1/profile.schema";

class ProfileService {
    async profile(id: number) {
        const member = await prisma.member.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profile: {
                    select: {
                        id: true,
                        memberId: true,
                        address: true,
                        bio: true,
                        gender: true,
                        profilePhoto: true,
                        coverPhoto: true,
                        age: true,
                        yearOfExp: true,
                        reason: true,
                        certificates: true,
                        photos: true,
                    }
                },
                shop: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        memberId: true,
                    }
                },
                memberType: {
                    select: {
                        id: true,
                        name: true,
                        memberPlans: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                duration: true,
                                isVideoGroup: true,
                                status: true,
                            }
                        }
                    }
                },
                providerTypes: {
                    select: {
                        id: true,
                        memberId: true,
                        providerType: true,
                    }
                },
                fcmToken: {
                    select: {
                        deviceType: true,
                        token: true,
                    }
                },
                language: true,
                theme: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!member) {
            throw new NotFoundException("Profile not found");
        }

        return member;
    }

    async update(id: number, updateProfileInput: UpdateProfileInput) {
        const { name, bio, gender, address, language, theme } = updateProfileInput;

        const existingMember = await this.profile(id);

        await prisma.member.update({
            where: { id },
            data: {
                name: name ?? existingMember.name,
                profile: {
                    upsert: {
                        update: {
                            bio: bio ?? existingMember.profile?.bio,
                            address: address ?? existingMember.profile?.address,
                            gender: gender ?? existingMember.profile?.gender,
                        },
                        create: {
                            bio: bio ?? null,
                            address: address ?? null,
                        },
                    },
                },
                language: language ?? existingMember.language,
                theme: theme ?? existingMember.theme,
            }
        });

        return this.profile(id);
    }

    async changePassword(id: number, changePasswordInput: ChangePasswordInput) {
        const { oldPassword, newPassword } = changePasswordInput;

        const existingMember = await prisma.member.findUnique({
            where: { id },
        });

        if (!existingMember) {
            throw new NotFoundException("Member not found");
        }

        const isPasswordCorrect = comparePassword(oldPassword, existingMember.password ?? "");

        if (!isPasswordCorrect) {
            throw new ValidationException("Failed to change password", [
                {
                    field: "oldPassword",
                    issue: "Old password is incorrect"
                },
            ]);
        }

        const hashedNewPassword = hashPassword(newPassword);

        await prisma.member.update({
            where: { id },
            data: {
                password: hashedNewPassword,
            },
        });

        return this.profile(id);
    }

    async updateBodyMeasurements(id: number, updateBodyMeasurementsInput: UpdateBodyMeasurementsInput) {
        const {
            heightFeet,
            heightInches,
            weight,
            neck,
            waist,
            shoulders,
            thigh,
            calf,
            arms,
            wrist,
            chest,
            hip } = updateBodyMeasurementsInput;

        const member = await prisma.member.update({
            where: { id },
            data: {
                bodyMeasurement: {
                    upsert: {
                        create: {
                            heightFeet,
                            heightInches,
                            weight,
                            neck,
                            waist,
                            shoulders,
                            thigh,
                            calf,
                            arms,
                            wrist,
                            chest,
                            hip,
                        },
                        update: {
                            heightFeet,
                            heightInches,
                            weight,
                            neck,
                            waist,
                            shoulders,
                            thigh,
                            calf,
                            arms,
                            wrist,
                            chest,
                            hip,
                        }
                    }
                }
            },
            select: {
                id: true,
                code: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                bodyMeasurement: true,
                profile: true,
                memberType: true,
                providerTypes: true,
                language: true,
                theme: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return member;
    }
}

export default ProfileService;