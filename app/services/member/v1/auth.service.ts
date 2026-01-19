import { OTP, ProviderType, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, UnauthorizedException, ValidationException } from "../../../helpers/exceptions";
import { sendOTPEmail } from "../../../helpers/send-mail";

class AuthService {
    async findActivatedMember(providerType: ProviderType, providerValue: string) {
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: providerType === ProviderType.EMAIL ? providerValue : null },
                    { phone: providerType === ProviderType.PHONE ? providerValue : null },
                ],
                status: Status.ACTIVE,
                deletedAt: null
            },
            include: {
                profile: true,
                memberType: true,
                providerTypes: true,
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

    async updateOrCreateOtpByEmail(email: string, otp: string, expiresAt: Date) {
        const existingEmail = await prisma.member.findFirst({
            where: {
                email,
                deletedAt: null
            },
        });

        if (existingEmail) {
            throw new ValidationException("Failed to request OTP", [
                {
                    field: "providerValue",
                    issue: "Email already in use",
                },
            ]);
        }

        let existingOtp = await prisma.oTP.findFirst({
            where: {
                email
            },
        });

        await sendOTPEmail(email, otp);

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
                    email: email,
                    otp: otp,
                    expiresAt: expiresAt,
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

        return existingOtp;
    }

    async findPendingOtp(providerType: ProviderType, providerValue: string) {
        return await prisma.oTP.findFirst({
            where: {
                OR: [
                    { email: providerType === ProviderType.EMAIL ? providerValue : null },
                    { phone: providerType === ProviderType.PHONE ? providerValue : null },
                ],
                isVerified: false,
                isUsed: false,
            },
        });
    }

    async checkDuplicateMember(providerType: ProviderType, providerValue: string) {

        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: providerType === ProviderType.EMAIL ? providerValue : null },
                    { phone: providerType === ProviderType.PHONE ? providerValue : null },
                ],
                deletedAt: null
            }
        });

        if (member) {
            throw new ValidationException("Failed to sign up", [
                {
                    field: "providerValue",
                    issue: `${providerType === ProviderType.EMAIL ? 'Email' : 'Phone'} is already registar`
                },
            ]);
        }

    }

    async validateOtpForSignUp(providerType: ProviderType, providerValue: string, otp: string) {
        const whereClause = providerType === ProviderType.EMAIL
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
}

export default AuthService;