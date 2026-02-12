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
  signInWithGoogleSchema,
  signInWithFacebookSchema,
} from "../../../schemas/member/v1/auth.schema";
import { ProviderType, Status } from "@prisma/client";
import AuthService from "../../../services/member/v1/auth.service";
import { ProfileResource } from "../../../resources/member/v1/profile/profile.resource";
import { sendSms } from "../../../helpers/send-sms";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signInWithGoogle(req: Request, res: Response) {
    const { data, error, success } = await validater(signInWithGoogleSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to sign in with Google", error);
    }

    const existingEmail = await prisma.member.findFirst({
      where: {
        email: data.email
      },
      include: {
        providerTypes: true,
        memberType: true,
      }
    });

    if (existingEmail) {
      // 1. Check if they already have GOOGLE linked
      const hasGoogle = existingEmail.providerTypes.some(p => p.providerType === ProviderType.GOOGLE);

      // 2. Only add GOOGLE if they don't have it yet
      if (!hasGoogle) {
        await prisma.member.update({
          where: { id: existingEmail.id },
          data: {
            providerTypes: {
              create: {
                providerType: ProviderType.GOOGLE,
              }
            }
          }
        });
      }

      const token: string = generateToken(
        { id: existingEmail.id, loginType: "member" },
        "30d"
      );

      // Note: You might want to re-fetch the user or manually update the object 
      // if ProfileResource needs the newly added providerType in the response.
      return successResponse(res, "User sign in successfully", {
        user: ProfileResource.toResource(existingEmail),
        token,
      });
    }

    const member = await prisma.member.create({
      data: {
        name: data.name,
        email: data.email,
        code: await generateMemberCode(),
        password: hashPassword("P@55w0rd"),
        status: Status.ACTIVE,
        providerTypes: {
          create: {
            providerType: ProviderType.GOOGLE
          }
        }
      }
    });

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

  async signInWithFacebook(req: Request, res: Response) {
    const { data, error, success } = await validater(signInWithFacebookSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to sign in with Facebook", error);
    }

    const existingPhone = await prisma.member.findFirst({
      where: {
        phone: data.phone
      },
      include: {
        providerTypes: true,
        memberType: true,
      }
    });

    if (existingPhone) {
      const hasFacebook = existingPhone.providerTypes.some(p => p.providerType === ProviderType.FACEBOOK);

      if (!hasFacebook) {
        await prisma.member.update({
          where: { id: existingPhone.id },
          data: {
            providerTypes: {
              create: {
                providerType: ProviderType.FACEBOOK,
              }
            }
          }
        });
      }

      const token: string = generateToken(
        { id: existingPhone.id, loginType: "member" },
        "30d"
      );

      return successResponse(res, "User sign in successfully", {
        user: ProfileResource.toResource(existingPhone),
        token,
      });
    }

    const member = await prisma.member.create({
      data: {
        name: data.name,
        phone: data.phone,
        code: await generateMemberCode(),
        password: hashPassword("P@55w0rd"),
        status: Status.ACTIVE,
        providerTypes: {
          create: {
            providerType: ProviderType.FACEBOOK,
          }
        }
      }
    });

    const token: string = generateToken(
      { id: member.id, loginType: "member" },
      "30d"
    );

    return successResponse(res, "Member sign in successfully", {
      user: ProfileResource.toResource(member),
      token,
    });
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
    const isDuplicate = await this.authService.checkDuplicateMember(data.providerType, data.providerValue);

    if (isDuplicate) {
      throw new ValidationException("Failed to request OTP", [
        {
          field: "providerValue",
          issue: `${data.providerType === ProviderType.EMAIL ? "Email" : "Phone"} is already registered`,
        },
      ]);
    }

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

    const isDuplicate = await this.authService.checkDuplicateMember(data.providerType, data.providerValue);

    if (isDuplicate) {
      throw new ValidationException("Failed to sign up", [
        {
          field: "providerValue",
          issue: `${data.providerType === ProviderType.EMAIL ? "Email" : "Phone"} is already registered`,
        },
      ]);
    }

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
