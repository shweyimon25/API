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
  SSOSchema,
  signInSchema,
  signUpSchema,
  requestOtpSchema,
  verifyOtpSchema,
  forgotPasswordRequestOtpSchema,
  forgotPasswordVerifyOtpSchema,
  forgotPasswordResetPasswordSchema,
  signInWithGoogleSchema,
  signInWithFacebookSchema,
  registerSchema,
  otpValidateSchema,
} from "../../../schemas/member/v1/auth.schema";
import { DeviceType, ProviderType, Status } from "@prisma/client";
import AuthService from "../../../services/member/v1/auth.service";
import { ProfileResource } from "../../../resources/member/v1/profile/profile.resource";
import { Member } from "@prisma/client";
import { sendMail } from "../../../helpers/send-mail";

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

  async login(req: Request, res: Response) {
    const { data, error, success } = await validater(signInSchema, req.body.params);

    if (!success) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": error[0].issue,
          "data": {}
        }
      })
    }

    const member = await this.authService.findActivatedMember(
      ProviderType.EMAIL,
      data.phone
    );

    const deviceType = data.device_info.includes("android") ? DeviceType.ANDROID : DeviceType.IOS;

    // // Create or Update FCM Token
    await this.authService.upsertFcmToken(member.id, data.firebase_token, deviceType);

    const passwordCompress = comparePassword(data.password, member.password);

    if (!passwordCompress) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Invalid password",
          "data": {}
        }
      })
    }

    const token: string = generateToken(
      {
        id: member.id,
      },
      "30d"
    );

    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
        "isFullFilled": true,
        "message": "login success",
        "data": {
          "user": {
            "id": member.id,
            "login": member.email,
            "name": member.name,
            "partner_id": member.id,
            "image": "",
            "member_info": {
              "id": member.id,
              "member_plan": member.memberRequests[0]?.memberPlan?.name,
              "member_type_level": null,
              "data_type": "trainer",
              "plan_duration": member.memberRequests[0]?.memberPlan?.duration,
              "expired_date": member.memberRequests[0]?.memberPlan?.expiredAt,
              "shop_plan": member.shop?.shopLevel?.name ?? null,
              "shop_duration": member.shop?.shopLevel?.duration ?? null,
              "shop_expired_date": null,
              "res_video_group": member.memberRequests[0]?.memberPlan?.isVideoGroup ?? false
            },
            "age": member.profile?.age,
            "gender": member.profile?.gender,
            "client_type": member.clientType,
            "client_code": member.code,
            "proficient_level": member.proficientLevel?.name ?? null,
            "main_goal_body_type": member.bodyGoal?.name ?? null,
            "need_info": false
          },
          "partner_id": {
            "id": member.id
          },
          "access_token": token
        }
      }
    });
  }

  async register(req: Request, res: Response) {
    const { data, error, success } = await validater(registerSchema, req.body.params);

    if (!success) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": error[0].issue,
          "data": {}
        }
      })
    }

    if (data.password !== data.confirm_password) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Password Not Match.",
          "data": {}
        }
      })
    }

    const deviceType = data.device_info.includes("android") ? DeviceType.ANDROID : DeviceType.IOS;

    const { otp, expiresAt } = generateOTP();

    const existingOtp = await prisma.oTP.findFirst({
      where: {
        email: data.email,
        isVerified: false,
        isUsed: false,
      },
    })

    if (!existingOtp) {
      await prisma.oTP.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.login,
          password: hashPassword(data.password),
          address: data.address,
          firebase_token: data.firebase_token,
          voip_token: data.voip_token,
          device_info: deviceType,
          otp: otp,
          expiresAt,
          isVerified: false,
          isUsed: false,
        },
      });
    } else {
      await prisma.oTP.update({
        where: { id: existingOtp.id },
        data: {
          email: data.email,
          name: data.name,
          phone: data.login,
          password: hashPassword(data.password),
          address: data.address,
          firebase_token: data.firebase_token,
          voip_token: data.voip_token,
          device_info: deviceType,
          otp: otp,
          expiresAt: expiresAt
        },
      });
    }

    sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USERNAME || "noreply@example.com",
      to: data.email,
      subject: "Register OTP",
      text: `Your OTP is ${otp}`,
    });

    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
        "isFullFilled": true,
        "message": "Registered OTP. ",
        "data": {
          "status": {
            "ok": true
          },
          "otp": otp
        }
      }
    })
  }

  async otpValidate(req: Request, res: Response) {
    const { data, error, success } = await validater(otpValidateSchema, req.body.params);

    if (!success) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": error[0].issue,
          "data": {}
        }
      })
    }

    const existingOtp = await prisma.oTP.findFirst({
      where: { email: data.email, otp: data.otp, isVerified: false, isUsed: false },
    });

    if (!existingOtp) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Invalid OTP",
        }
      })
    }

    if (existingOtp.expiresAt < new Date()) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "OTP expired",
        }
      })
    }

    const existingEmailMember = existingOtp.email
      ? await prisma.member.findUnique({
          where: { email: existingOtp.email },
          select: { id: true },
        })
      : null;

    if (existingEmailMember) {
      await prisma.oTP.update({
        where: { id: existingOtp.id },
        data: { isVerified: true, isUsed: true },
      });

      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Email already registered",
          "data": {}
        }
      })
    }

    await prisma.oTP.update({
      where: { id: existingOtp.id },
      data: { isVerified: true, isUsed: true },
    });

    let member: any;
    try {
      member = await prisma.member.create({
        data: {
          name: existingOtp.name ?? "",
          email: existingOtp.email,
          password: existingOtp.password ?? "",
          status: Status.ACTIVE,
          code: await generateMemberCode(),
          profile: {
            create: {
              address: existingOtp.address ?? "",
            },
          },
          bodyMeasurement: {
            create: {},
          },
          providerTypes: {
            create: {
              providerType: ProviderType.EMAIL,
            },
          },
        },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        return res.json({
          "jsonrpc": "2.0",
          "id": null,
          "result": {
            "isFullFilled": false,
            "message": "Email already registered",
            "data": {}
          }
        })
      }
      throw e;
    }

    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
        "isFullFilled": true,
        "message": "OTP validated successfully",
        "data": {
          "user": {
            "id": member.id // member_id
          }
        }
      }
    })
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

  async SSOLogin(req: Request, res: Response) {
    const { data, error, success } = await validater(SSOSchema, req.body.params);

    if (!success) {
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": error[0].issue,
          "data": {}
        }
      })
    }

    // 1. Provider-to-Field Mapping 
    const providerMapping: Record<string, { enum: ProviderType; searchField: string }> = {
      google: { enum: ProviderType.GOOGLE, searchField: 'email' },
      facebook: { enum: ProviderType.FACEBOOK, searchField: 'phone' },
      apple: { enum: ProviderType.APPLE, searchField: 'appleId' }
    };

    const currentProvider = providerMapping[data.provider_type];
    if (!currentProvider) {
      // throw new ValidationException("Invalid provider type", error);
      return res.json({
        "jsonrpc": "2.0",
        "id": null,
        "result": {
          "isFullFilled": false,
          "message": "Invalid provider type",
          "data": {}
        }
      })
    }

    const includeRelations = {
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
              id: true,
              name: true,
              duration: true,
              price: true,
              isVideoGroup: true,
              expiredAt: true,
              status: true,
              memberTypeId: true
            },
          },
        },
      }
    };

    // 2. Dynamic Search member depends on provider_type
    let member = await prisma.member.findFirst({
      where: {
        [currentProvider.searchField]: data.login
      },
      include: includeRelations
    });

    if (member) {
      // 3. Check if they already have linked with provider
      const hasLinked = member.providerTypes.some(p => p.providerType === currentProvider.enum);

      if (!hasLinked) {
        member = await prisma.member.update({
          where: { id: member.id },
          data: {
            providerTypes: {
              create: { providerType: currentProvider.enum }
            }
          },
          include: includeRelations
        });
      }
    } else {
      // 4. Create new member
      member = await prisma.member.create({
        data: {
          name: data.name,
          email: data.provider_type === 'google' ? data.login : data.email,
          phone: data.provider_type === 'facebook' ? data.login : null,
          appleId: data.provider_type === 'apple' ? data.login : null,
          code: await generateMemberCode(),
          password: hashPassword(process.env.DEFAULT_MEMBER_PASSWORD || "P@55w0rd"),
          status: Status.ACTIVE,
          providerTypes: {
            create: { providerType: currentProvider.enum }
          }
        },
        include: includeRelations
      });
    }
    // 5. Create or Update FCM Token    
    await this.authService.upsertFcmToken(member.id, data.firebase_token, data.device_info.toUpperCase());
 
    // 6. Generate Token
    const token: string = generateToken(
      {
        id: member.id,
      },
      "30d"
    );

    return res.json({
      "jsonrpc": "2.0",
      "id": null,
      "result": {
        "isFullFilled": true,
        "message": "login success",
        "data": {
          "user": {
            "id": member.id,
            "login": member.email,
            "name": member.name,
            "partner_id": member.id,
            "image": "",
            "member_info": {
              "id": member.memberRequests[0]?.memberPlan?.id ?? null,
              "member_plan": member.memberRequests[0]?.memberPlan?.name,
              "member_type_level": null,
              "data_type": member.memberType?.name ?? null,
              "plan_duration": member.memberRequests[0]?.memberPlan?.duration,
              "expired_date": member.memberRequests[0]?.memberPlan?.expiredAt,
              "shop_plan": member.shop?.shopLevel?.name ?? null,
              "shop_duration": member.shop?.shopLevel?.duration ?? null,
              "shop_expired_date": null,
              "res_video_group": member.memberRequests[0]?.memberPlan?.isVideoGroup ?? false
            },
            "age": member.profile?.age,
            "gender": member.profile?.gender,
            "client_type": member.clientType,
            "client_code": member.code,
            "proficient_level": member.proficientLevel?.name ?? null,
            "main_goal_body_type": member.bodyGoal?.name ?? null,
            "need_info": false
          },
          "partner_id": {
            "id": member.id
          },
          "access_token": token
        }
      }
    });
  }

  async updateToken(req: Request, res: Response) {
    const memberId = (req.user as Member).id;
    if (req.body.params.device_info === 'ios') {
      await this.authService.upsertFcmToken(memberId, req.body.params.voip_token, req.body.params.device_info.toUpperCase());
    } else {
      await this.authService.upsertFcmToken(memberId, req.body.params.firebase_token, req.body.params.device_info.toUpperCase());
    }

    return res.json({
      "jsonrpc": "2.0",
      "result": {
        "isFullFilled": true,
        "message": "Firebase Token Updated",
      }
    });

  }
}

export default AuthController;
