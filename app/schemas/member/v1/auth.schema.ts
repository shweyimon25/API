import { z } from "zod";
import { DeviceType, ProviderType } from "@prisma/client";

export const requestOtpSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
    providerValue: z.string(),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z
        .string({
          message: "Email is required"
        })
        .email({
          message: "Invalid email address",
        })
    }

    if (data.providerType === ProviderType.PHONE) {
      return z
        .string({
          message: "Phone number is required"
        })
        .min(6, { message: "Phone number is required" })
        .max(15, { message: "Phone number is too long" });
    }
  });

export const verifyOtpSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
    providerValue: z.string(),
    otp: z.string(),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z
        .string({ message: "Email is required" })
        .email({
          message: "Invalid email address",
        });
    }

    if (data.providerType === ProviderType.PHONE) {
      return z
        .string()
        .min(6, { message: "Phone number is required" })
        .max(15, { message: "Phone number is too long" });
    }
  });

export const signUpSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
    providerValue: z.string(),
    name: z.string({ message: "Name is required" }),
    address: z.string().optional(),
    otp: z
      .string()
      .min(6, { message: "OTP must be 6 digits" })
      .max(6, { message: "OTP must be 6 digits" }),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        }
      ),
    passwordConfirm: z.string(),
    fcmToken: z.string({ message: "FCM token is required" }),
    deviceType: z.nativeEnum(DeviceType, { message: "Device type must be ANDROID | IOS | WEB" }),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z
        .string({ message: "Email is required" })
        .email({ message: "Invalid email address" });
    }

    if (data.providerType === ProviderType.PHONE) {
      return z
        .string()
        .min(6, { message: "Phone number is required" })
        .max(15, { message: "Phone number is too long" });
    }
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
  });

export const sigInSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
    providerValue: z.string(),
    password: z.string({ message: "Password is required" }),
    fcmToken: z.string({ message: "FCM token is required" }),
    deviceType: z.nativeEnum(DeviceType, { message: "Device type must be ANDROID | IOS | WEB" }),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z.string({ message: "Email is required" }).email({
        message: "Invalid email address",
      });
    } else {
      return z
        .string()
        .min(9, { message: "Phone number is required" })
        .max(15, { message: "Phone number must be at most 15 characters" });
    }
  });

export const updateBodyMeasurementsSchema = z.object({
  heightFeet: z.string({ message: "Height in feet is required" }),
  heightInches: z.string({ message: "Height in inches is required" }),
  weight: z.string({ message: "Weight is required" }),
  neck: z.string({ message: "Neck is required" }),
  waist: z.string({ message: "Waist is required" }),
  shoulders: z.string({ message: "Shoulders is required" }),
  thigh: z.string({ message: "Thigh is required" }),
  calf: z.string({ message: "Calf is required" }),
  arms: z.string({ message: "Arms is required" }),
  wrist: z.string({ message: "Wrist is required" }),
  chest: z.string({ message: "Chest is required" }),
  hip: z.string({ message: "Hip is required" }),
});

export const forgotPasswordRequestOtpSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
    providerValue: z.string({ message: "Email or phone is required" }),
  })
  .refine(
    (data) => {
      if (data.providerType === ProviderType.EMAIL) {
        return z.string().email().safeParse(data.providerValue).success;
      }
      return data.providerValue.length >= 9 && data.providerValue.length <= 15;
    },
    { message: "Invalid email or phone for the selected type" }
  );

export const forgotPasswordVerifyOtpSchema = z.object({
  providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
  providerValue: z.string(),
  otp: z.string().min(6, { message: "OTP is required" }).max(6, { message: "OTP must be 6 digits" }),
});

export const forgotPasswordResetPasswordSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType, { message: "Provider type must be EMAIL | PHONE" }),
    providerValue: z.string(),
    otp: z.string().min(6, { message: "OTP is required" }).max(6, { message: "OTP must be 6 digits" }),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        }
      ),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords don't match",
    path: ["newPasswordConfirm"],
  });

export const signInWithGoogleSchema = z.object({
  email: z.string({
    message: "Email is required"
  }).email({
    message: "Email is invalid"
  }),
  name: z.string({
    message: "Name is required"
  })
});

export const signInWithFacebookSchema = z.object({
  phone: z.string({
    message: "Phone is required"
  }).min(9, { message: "Phone number is required" })
    .max(15, { message: "Phone number must be at most 15 characters" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only numbers" }),
  name: z.string({
    message: "Name is required"
  }),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type SignInInput = z.infer<typeof sigInSchema>;
export type SignInWithGoogleInput = z.infer<typeof signInWithGoogleSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UpdateBodyMeasurementsInput = z.infer<typeof updateBodyMeasurementsSchema>;
export type ForgotPasswordRequestOtpInput = z.infer<typeof forgotPasswordRequestOtpSchema>;
export type ForgotPasswordVerifyOtpInput = z.infer<typeof forgotPasswordVerifyOtpSchema>;
export type ForgotPasswordResetPasswordInput = z.infer<typeof forgotPasswordResetPasswordSchema>;