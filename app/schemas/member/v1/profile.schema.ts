import { Gender, Language, Theme } from "@prisma/client";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be string",
    })
    .optional(),
  bio: z
    .string({
      invalid_type_error: "Bio must be string",
    })
    .optional(),
  gender: z.nativeEnum(Gender).optional(),
  address: z
    .string({
      invalid_type_error: "Address must be string",
    })
    .optional(),
  language: z.nativeEnum(Language).optional(),
  theme: z.nativeEnum(Theme).optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string({
      required_error: "Old password is required",
      invalid_type_error: "Old password must be string",
    }),
    newPassword: z
      .string({
        required_error: "New password is required",
        invalid_type_error: "New password must be string",
      })
      .min(8, {
        message: "New password must be at least 8 characters",
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "New password must include uppercase, lowercase, number, and special character",
        }
      ),
    confirmNewPassword: z.string({
      required_error: "Confirm new password is required",
      invalid_type_error: "Confirm new password must be string",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
