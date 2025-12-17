import prisma from "../../../../prisma/client";
import { NotFoundException, ValidationException } from "../../../helpers/exceptions";
import { comparePassword, hashPassword } from "../../../helpers/helper";
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
                profile: true,
                memberType: true,
                providerTypes: true,
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

        const isPasswordCorrect = comparePassword(oldPassword, existingMember.password);

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
}

export default ProfileService;