import { generateMemberCode, hashPassword } from "./../../../helpers/helper";
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
import { OTP, ProviderType, Status } from "@prisma/client";

class AuthController {
  async signIn(req: Request, res: Response) {
    const { data, error, success } = await validater(sigInSchema, req.body);

    if (!success) {
      throw new ValidationException("Unauthorized", error);
    }

    const member = await prisma.member.findFirst({
      where: {
        OR: [{ email: data.providerType }, { phone: data.providerType }],
        status: Status.ACTIVE,
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

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

    // Check existing email
    if (data.providerType === ProviderType.EMAIL) {
      const existingEmail = await prisma.member.findFirst({
        where: {
          email: data.providerValue,
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

      const existingOtp = await prisma.oTP.findFirst({
        where: {
          email: data.providerValue,
        },
      });

      if (existingOtp) {
        await prisma.oTP.update({
          where: {
            id: existingOtp.id,
          },
          data: {
            otp: newOtp,
            expiresAt: expiresAt,
            isUsed: false,
          },
        });
      } else {
        await prisma.oTP.create({
          data: {
            email: data.providerValue,
            otp: newOtp,
            expiresAt: expiresAt,
          },
        });
      }

      return successResponse(res, "OTP requested successfully", {
        providerType: data.providerType,
        providerValue: data.providerValue,
      });
    }

    // Check existing phone
    if (data.providerType === ProviderType.PHONE) {
      const existingPhone = await prisma.member.findFirst({
        where: {
          phone: data.providerValue,
        },
      });

      if (existingPhone) {
        throw new ValidationException("Failed to request OTP", [
          {
            field: "providerValue",
            issue: "Phone number already in use",
          },
        ]);
      }

      const existingOtp = await prisma.oTP.findFirst({
        where: {
          phone: data.providerValue,
        },
      });

      if (existingOtp) {
        await prisma.oTP.update({
          where: {
            id: existingOtp.id,
          },
          data: {
            otp: newOtp,
            expiresAt: expiresAt,
            isUsed: false,
          },
        });
      } else {
        await prisma.oTP.create({
          data: {
            phone: data.providerValue,
            otp: newOtp,
            expiresAt: expiresAt,
          },
        });
      }

      return successResponse(res, "OTP requested successfully", {
        providerType: data.providerType,
        providerValue: data.providerValue,
      });
    }
  }

  async verifyOTP(req: Request, res: Response) {
    const { data, error, success } = await validater(verifyOtpSchema, req.body);

    if (!success) {
      throw new ValidationException("Failed to verify OTP", error);
    }

    let existingOtp: OTP | null = null;

    if (data.providerType === ProviderType.EMAIL) {
      existingOtp = await prisma.oTP.findFirst({
        where: {
          email: data.providerValue,
          otp: data.otp,
        },
      });
    }

    if (data.providerType === ProviderType.PHONE) {
      existingOtp = await prisma.oTP.findFirst({
        where: {
          phone: data.providerValue,
          otp: data.otp,
        },
      });
    }

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

    if (existingOtp.isUsed) {
      throw new ValidationException("Failed to verify OTP", [
        {
          field: "otp",
          issue: "OTP already used",
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

    let existingOtp: OTP | null = null;

    // Check for existing email
    if (data.providerType === ProviderType.EMAIL) {
      const existingEmail = await prisma.member.findFirst({
        where: {
          email: data.providerValue,
        },
      });

      if (existingEmail) {
        throw new ValidationException("Failed to sign up", [
          {
            field: "providerValue",
            issue: "Email already in use",
          },
        ]);
      }

      existingOtp = await prisma.oTP.findFirst({
        where: {
          email: data.providerValue,
          otp: data.otp,
        },
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
    }

    // Check for existing phone
    if (data.providerType === ProviderType.PHONE) {
      const existingPhone = await prisma.member.findFirst({
        where: {
          phone: data.providerValue,
        },
      });

      if (existingPhone) {
        throw new ValidationException("Failed to sign up", [
          {
            field: "providerValue",
            issue: "Phone number already in use",
          },
        ]);
      }

      existingOtp = await prisma.oTP.findFirst({
        where: {
          phone: data.providerValue,
          otp: data.otp,
        },
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
    }

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

    if (existingOtp) {
      await prisma.oTP.update({
        where: {
          id: existingOtp.id,
        },
        data: {
          isUsed: true,
        },
      });
    }

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
