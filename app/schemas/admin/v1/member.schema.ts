import { z } from "zod";
import { Status } from "@prisma/client";

export const createMemberSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().optional(),
    phone: z
      .string()
      .min(9, { message: "Phone must be at least 9 digits long" })
      .max(15, { message: "Phone must be at most 15 digits long" })
      .optional(),
    memberTypeId: z.coerce.number().min(1, { message: "Member type id is required" }),
    address: z
      .string().optional(),
    bio: z
      .string().optional(),
    status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
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
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  })
  .refine((data) => {
    if (data.email !== undefined) {
      return z
        .string()
        .email({ message: "Invalid email address" });
    }
    if (data.phone !== undefined) {
      return z
        .string()
        .min(9, { message: "Phone must be at least 9 characters" })
        .max(15, { message: "Phone must be at most 15 characters" });
    }
  });

export const updateMemberSchema = z
  .object({
    name: z
      .string().optional(),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .optional(),
    phone: z
      .string()
      .min(9, {
        message: "Phone must be at least 9 characters",
      })
      .max(15, {
        message: "Phone must be at most 15 characters",
      })
      .optional(),
    memberTypeId: z.coerce
      .number()
      .optional(),
    address: z
      .string()
      .optional(),
    bio: z
      .string()
      .optional(),
    status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        }
      )
      .optional(),
    passwordConfirm: z
      .string()
      .optional(),
  })
  .refine(
    (data) => {
      // Only validate if password is provided
      if (data.password) {
        return data.password === data.passwordConfirm;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["passwordConfirm"],
    }
  )
  .refine(
    (data) => {
      // If passwordConfirm is provided, password must also be provided
      if (data.passwordConfirm && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required when password confirm is provided",
      path: ["password"],
    }
  );

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
