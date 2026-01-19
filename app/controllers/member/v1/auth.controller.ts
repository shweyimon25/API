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
} from "../../../schemas/member/v1/auth.schema";
import { ProviderType, Status } from "@prisma/client";
import { sendOTPEmail } from "../../../helpers/send-mail";
import AuthService from "../../../services/member/v1/auth.service";

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
      user: {
        id: member.id,
        code: member.code,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        profile: member.profile,
        memberType: member.memberType,
        providerTypes: member.providerTypes,
      },
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

    // Check existing email
    if (data.providerType === ProviderType.EMAIL) {
      const existingOtp = await this.authService.updateOrCreateOtpByEmail(data.providerValue, otp, expiresAt);
      return successResponse(res, "OTP requested successfully", {
        providerType: ProviderType.EMAIL,
        providerValue: existingOtp.email,
      });
    }

    // Check existing phone
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
        profile: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        memberType: true,
        providerTypes: true,
      },
    });

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
      user: member,
      token,
    });
  }
}

export default AuthController;
