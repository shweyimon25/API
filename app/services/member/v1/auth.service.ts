import { DeviceType, ProviderType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException, UnauthorizedException, ValidationException } from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import { sendOTPEmail } from "../../../helpers/send-mail";
import { generateAuthToken, sendSms } from "../../../helpers/send-sms";

class AuthService {
    async findActivatedMember(providerType: ProviderType, providerValue: string) {
        const where =
            providerType === ProviderType.EMAIL || providerType === ProviderType.GOOGLE
                ? { email: providerValue, status: Status.ACTIVE }
                : { phone: providerValue, status: Status.ACTIVE };

        const member = await prisma.member.findFirst({
            where,
            include: {
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
                    },
                },
                memberType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                shop: {
                    include: {
                        shopLevel: true,
                    },
                },
                providerTypes: {
                    select: {
                        providerType: true,
                    },
                },
                fcmToken: {
                    select: {
                        deviceType: true,
                        token: true,
                    },
                },
                proficientLevel: {
                    select: {
                        name: true,
                    },
                },
                bodyGoal: {
                    select: {
                        name: true,
                    },
                },
                memberRequests: {
                    select: {
                        id: true,
                        memberPlan: {
                            select: {
                                name: true,
                                duration: true,
                                price: true,
                                isVideoGroup: true,
                                expiredAt: true,
                                status: true,
                            },
                        },
                    },
                }
            },
        });

        if (!member) {
            throw new UnauthorizedException();
        }

        if (member.status === Status.INACTIVE) {
            throw new BadRequestException("This account is suspended.")
        }

        return member;
    }

    /** For sign-up: email must NOT be registered yet */
    async updateOrCreateOtpByEmail(email: string, otp: string, expiresAt: Date) {
        const existingEmail = await prisma.member.findFirst({
            where: { email },
        });

        if (existingEmail) {
            throw new ValidationException("Failed to request OTP", [
                {
                    field: "providerValue",
                    issue: "Email already in use",
                },
            ]);
        }

        await sendOTPEmail(email, otp);
        return this.upsertOtpByEmail(email, otp, expiresAt);
    }

    /** For forgot-password: only create/update OTP and send email (member existence checked in controller) */
    async updateOrCreateOtpByEmailOnly(email: string, otp: string, expiresAt: Date) {
        await sendOTPEmail(email, otp);
        return this.upsertOtpByEmail(email, otp, expiresAt);
    }

    private async upsertOtpByEmail(email: string, otp: string, expiresAt: Date) {
        let existingOtp = await prisma.oTP.findFirst({
            where: { email },
        });

        if (existingOtp) {
            existingOtp = await prisma.oTP.update({
                where: {
                    id: existingOtp.id,
                },
                data: {
                    otp: otp,
                    expiresAt: expiresAt,
                    isUsed: false,
                    isVerified: false,
                },
            });
        } else {
            existingOtp = await prisma.oTP.create({
                data: {
                    email,
                    otp,
                    expiresAt,
                    isUsed: false,
                    isVerified: false,
                },
            });
        }

        return existingOtp;
    }

    async updateOrCreateOtpByPhone(phone: string, otp: string, expiresAt: Date) {
        let existingOtp = await prisma.oTP.findFirst({
            where: {
                phone
            },
        });

        if (existingOtp) {
            existingOtp = await prisma.oTP.update({
                where: {
                    id: existingOtp.id,
                },
                data: {
                    otp: otp,
                    expiresAt: expiresAt,
                    isUsed: false,
                    isVerified: false,
                },
            });
        } else {
            existingOtp = await prisma.oTP.create({
                data: {
                    phone,
                    otp: otp,
                    expiresAt: expiresAt,
                },
            });
        }

        await sendSms(phone, `Your OTP is ${otp}`);

        return existingOtp;
    }

    async findPendingOtp(providerType: ProviderType, providerValue: string) {
        const where =
            providerType === ProviderType.EMAIL || providerType === ProviderType.GOOGLE
                ? { email: providerValue, isVerified: false, isUsed: false }
                : { phone: providerValue, isVerified: false, isUsed: false };

        return await prisma.oTP.findFirst({
            where,
        });
    }

    async checkDuplicateMember(providerType: ProviderType, providerValue: string) {
        const where =
            providerType === ProviderType.EMAIL || providerType === ProviderType.GOOGLE
                ? { email: providerValue }
                : { phone: providerValue };

        const member = await prisma.member.findFirst({
            where,
        });

        return member ? true : false;
    }

    async validateOtpForSignUp(providerType: ProviderType, providerValue: string, otp: string) {
        const whereClause = providerType === ProviderType.EMAIL || providerType === ProviderType.GOOGLE
            ? { email: providerValue, otp }
            : { phone: providerValue, otp };

        const existingOtp = await prisma.oTP.findFirst({
            where: whereClause,
        });

        if (!existingOtp) {
            throw new ValidationException("Failed to sign up", [
                {
                    field: "otp",
                    issue: "Invalid OTP",
                },
            ]);
        }

        if (existingOtp.expiresAt < new Date()) {
            throw new ValidationException("Failed to sign up", [
                {
                    field: "otp",
                    issue: "OTP expired",
                },
            ]);
        }

        if (existingOtp.isUsed) {
            throw new ValidationException("Failed to sign up", [
                {
                    field: "otp",
                    issue: "OTP already used",
                },
            ]);
        }

        return existingOtp;
    }

    /** Forgot password: find OTP by provider, check not expired and otp matches, return OTP (controller will set isVerified) */
    async validateOtpForForgotPasswordVerify(providerType: ProviderType, providerValue: string, otp: string) {
        const whereClause =
            providerType === ProviderType.EMAIL || providerType === ProviderType.GOOGLE
                ? { email: providerValue, otp, isVerified: false, isUsed: false }
                : { phone: providerValue, otp, isVerified: false, isUsed: false };

        const existingOtp = await prisma.oTP.findFirst({
            where: whereClause,
        });

        if (!existingOtp) {
            throw new ValidationException("Failed to verify OTP", [
                { field: "otp", issue: "Invalid OTP" },
            ]);
        }

        if (existingOtp.expiresAt < new Date()) {
            throw new ValidationException("Failed to verify OTP", [
                { field: "otp", issue: "OTP expired" },
            ]);
        }

        return existingOtp;
    }

    /** Forgot password reset: OTP must be verified, then update member password and mark OTP used */
    async resetPasswordWithOtp(providerType: ProviderType, providerValue: string, otp: string, newPassword: string) {
        const whereClause =
            providerType === ProviderType.EMAIL || providerType === ProviderType.GOOGLE
                ? { email: providerValue, otp, isVerified: true }
                : { phone: providerValue, otp, isVerified: true };

        const existingOtp = await prisma.oTP.findFirst({
            where: whereClause,
        });

        if (!existingOtp) {
            throw new ValidationException("Failed to reset password", [
                { field: "otp", issue: "Invalid or unverified OTP" },
            ]);
        }

        if (existingOtp.expiresAt < new Date()) {
            throw new ValidationException("Failed to reset password", [
                { field: "otp", issue: "OTP expired" },
            ]);
        }

        if (existingOtp.isUsed) {
            throw new ValidationException("Failed to reset password", [
                { field: "otp", issue: "OTP already used" },
            ]);
        }

        const member = await this.findActivatedMember(providerType, providerValue);

        await prisma.$transaction([
            prisma.member.update({
                where: { id: member.id },
                data: { password: hashPassword(newPassword) },
            }),
            prisma.oTP.update({
                where: { id: existingOtp.id },
                data: { isUsed: true },
            }),
        ]);

        return member;
    }

    async upsertFcmToken(memberId: number, token: string, deviceType: DeviceType) {
        return await prisma.memberFcmToken.upsert({
            where: {
                memberId: memberId,
            },
            update: {
                token: token,
                deviceType: deviceType,
            },
            create: {
                memberId: memberId,
                token: token,
                deviceType: deviceType,
            },
        });
    }
}

export default AuthService;