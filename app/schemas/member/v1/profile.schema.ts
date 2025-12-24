import { Gender, Language, Theme } from "@prisma/client";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .optional(),
  bio: z
    .string()
    .min(1, { message: "Bio is required" })
    .optional(),
  gender: z.nativeEnum(Gender, { message: "Gender must be MALE | FEMALE | BOTH" }).optional(),
  address: z
    .string()
    .min(1, { message: "Address is required" })
    .optional(),
  language: z.nativeEnum(Language, { message: "Language must be ENGLISH | ARABIC" }).optional(),
  theme: z.nativeEnum(Theme, { message: "Theme must be LIGHT | DARK" }).optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: "Old password is required" }),
    newPassword: z
      .string()
      .min(1, { message: "New password is required" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "New password must include uppercase, lowercase, number, and special character",
        }
      ),
    confirmNewPassword: z.string().min(1, { message: "Confirm new password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
