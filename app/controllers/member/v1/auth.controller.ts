import { generateMemberCode, generateOTP, hashPassword } from "./../../../helpers/helper";
import { Request, Response } from "express";
import prisma from "../../../../prisma/client";
import { validater } from "../../../helpers/validator";
import {
  UnauthorizedException,
  ValidationException,
} from "../../../helpers/exceptions";
import { comparePassword, generateToken } from "../../../helpers/helper";
import { successResponse } from "../../../helpers/response";
import {
  sigInSchema,
  signUpSchema,
  requestOtpSchema,
  verifyOtpSchema,
  forgotPasswordRequestOtpSchema,
  forgotPasswordVerifyOtpSchema,
  forgotPasswordResetPasswordSchema,
} from "../../../schemas/member/v1/auth.schema";
import { ProviderType, Status } from "@prisma/client";
import AuthService from "../../../services/member/v1/auth.service";
import { ProfileResource } from "../../../resources/member/v1/profile/profile.resource";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signIn(req: Request, res: Response) {
    const { data, error, success } = await validater(sigInSchema, req.body);

    if (!success) {
      throw new ValidationException("Unauthorized", error);
    }

    const member = await this.authService.findActivatedMember(data.providerType, data.providerValue);

    // Create or Update FCM Token
    await this.authService.upsertFcmToken(member.id, data.fcmToken, data.deviceType);

    const passwordCompress = comparePassword(data.password, member.password);

    if (!passwordCompress) {
      throw new UnauthorizedException();
    }

    const token: string = generateToken(
      {
        id: member.id,
        loginType: "member",
      },
      "30d"
    );

    return successResponse(res, "User sign in successfully", {
      user: ProfileResource.toResource(member),
      token,
    });
  }

  async requestOTP(req: Request, res: Response) {
    const { data, error, success } = await validater(
      requestOtpSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Failed to request OTP", error);
    }

    const { otp, expiresAt } = generateOTP();

    // Check if member already exists
    await this.authService.checkDuplicateMember(data.providerType, data.providerValue);

    // Check existing email otp
    if (data.providerType === ProviderType.EMAIL) {
      const existingOtp = await this.authService.updateOrCreateOtpByEmail(data.providerValue, otp, expiresAt);
      return successResponse(res, "OTP requested successfully", {
        providerType: ProviderType.EMAIL,
        providerValue: existingOtp.email,
      });
    }

    // Check existing phone otp
    if (data.providerType === ProviderType.PHONE) {
      const existingOtp = await this.authService.updateOrCreateOtpByPhone(data.providerValue, otp, expiresAt);

      return successResponse(res, "OTP requested successfully", {
        providerType: ProviderType.PHONE,
        providerValue: existingOtp.phone,
      });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    const { data, error, success } = await validater(verifyOtpSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to verify OTP", error);
    }

    const existingOtp = await this.authService.findPendingOtp(data.providerType, data.providerValue);

    if (!existingOtp) {
      throw new ValidationException("Failed to verify OTP", [
        {
          field: "otp",
          issue: "Invalid OTP",
        },
      ]);
    }

    if (existingOtp.expiresAt < new Date()) {
      throw new ValidationException("Failed to verify OTP", [
        {
          field: "otp",
          issue: "OTP expired",
        },
      ]);
    }

    await prisma.oTP.update({
      where: {
        id: existingOtp.id,
      },
      data: {
        isVerified: true,
      },
    });

    return successResponse(res, "OTP verified successfully", {
      providerType: data.providerType,
      providerValue: data.providerValue,
    });
  }

  async signUp(req: Request, res: Response) {
    const { data, error, success } = await validater(signUpSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to sign up", error);
    }

    await this.authService.checkDuplicateMember(data.providerType, data.providerValue);

    const existingOtp = await this.authService.validateOtpForSignUp(data.providerType, data.providerValue, data.otp);

    const member = await prisma.member.create({
      data: {
        name: data.name,
        code: await generateMemberCode(),
        email:
          data.providerType === ProviderType.EMAIL ? data.providerValue : null,
        phone:
          data.providerType === ProviderType.PHONE ? data.providerValue : null,
        profile: {
          create: {
            address: data.address,
          },
        },
        bodyMeasurement: {
          create: {},
        },
        password: hashPassword(data.password),
        status: Status.ACTIVE,
        providerTypes: {
          create: {
            providerType: data.providerType,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        code: true,
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
        providerTypes: {
          select: {
            providerType: true,
          },
        },
        fcmToken: {
          select: {
            token: true,
            deviceType: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
            memberId: true,
          }
        },
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create or Update FCM Token
    await this.authService.upsertFcmToken(member.id, data.fcmToken, data.deviceType);

    await prisma.oTP.update({
      where: {
        id: existingOtp.id,
      },
      data: {
        isUsed: true,
      },
    });

    const token: string = generateToken(
      {
        id: member.id,
        loginType: "member",
      },
      "30d"
    );

    return successResponse(res, "User sign up successfully", {
      user: ProfileResource.toResource(member),
      token,
    });
  }

  async forgotPasswordRequestOtp(req: Request, res: Response) {
    const { data, success, error } = await validater(forgotPasswordRequestOtpSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to request OTP", error);
    }

    await this.authService.findActivatedMember(data.providerType, data.providerValue);

    const { otp, expiresAt } = generateOTP();

    if (data.providerType === ProviderType.EMAIL) {
      await this.authService.updateOrCreateOtpByEmailOnly(data.providerValue, otp, expiresAt);
    } else {
      await this.authService.updateOrCreateOtpByPhone(data.providerValue, otp, expiresAt);
    }

    return successResponse(res, "OTP sent successfully", {
      providerType: data.providerType,
      providerValue: data.providerValue,
    });
  }

  async forgotPasswordVerifyOtp(req: Request, res: Response) {
    const { data, success, error } = await validater(forgotPasswordVerifyOtpSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to verify OTP", error);
    }

    await this.authService.validateOtpForForgotPasswordVerify(data.providerType, data.providerValue, data.otp);

    const existingOtp = await prisma.oTP.findFirst({
      where:
        data.providerType === ProviderType.EMAIL
          ? { email: data.providerValue, otp: data.otp }
          : { phone: data.providerValue, otp: data.otp },
    });

    if (existingOtp) {
      await prisma.oTP.update({
        where: { id: existingOtp.id },
        data: { isVerified: true },
      });
    }

    return successResponse(res, "OTP verified successfully", {
      providerType: data.providerType,
      providerValue: data.providerValue,
    });
  }

  async forgotPasswordResetPassword(req: Request, res: Response) {
    const { data, success, error } = await validater(forgotPasswordResetPasswordSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to reset password", error);
    }

    const member = await this.authService.resetPasswordWithOtp(
      data.providerType,
      data.providerValue,
      data.otp,
      data.newPassword
    );

    return successResponse(res, "Password reset successfully", {
      user: ProfileResource.toResource(member),
    });
  }
}

export default AuthController;
