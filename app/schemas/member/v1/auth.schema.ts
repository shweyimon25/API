import { z } from "zod";
import { ProviderType } from "@prisma/client";

export const requestOtpSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType),
    providerValue: z.string(),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z
        .string()
        .email({
          message: "Invalid email address",
        })
        .min(1, { message: "Email is required" });
    }

    if (data.providerType === ProviderType.PHONE) {
      return z
        .string()
        .min(6, { message: "Phone number is required" })
        .max(15, { message: "Phone number is too long" });
    }
  });

export const verifyOtpSchema = z
  .object({
    providerType: z.nativeEnum(ProviderType),
    providerValue: z.string(),
    otp: z.string(),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z
        .string()
        .email({
          message: "Invalid email address",
        })
        .min(1, { message: "Email is required" });
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
    providerType: z.nativeEnum(ProviderType),
    providerValue: z.string(),
    name: z.string().min(1, { message: "Name is required" }),
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
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z
        .string()
        .email({ message: "Invalid email address" })
        .min(1, { message: "Email is required" });
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
    providerType: z.nativeEnum(ProviderType),
    providerValue: z.string(),
    password: z.string({
      required_error: "Password is required",
      invalid_type_error: "Password must be string",
    }),
  })
  .refine((data) => {
    if (data.providerType === ProviderType.EMAIL) {
      return z.string().email({
        message: "Invalid email address",
      });
    } else {
      return z
        .string()
        .min(6, { message: "Phone number is required" })
        .max(15, { message: "Phone number is too long" });
    }
  });

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type SignInInput = z.infer<typeof sigInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
