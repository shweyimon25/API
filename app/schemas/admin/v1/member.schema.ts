import { z } from "zod";
import { Status } from "@prisma/client";

export const createMemberSchema = z
  .object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be string",
    }),
    email: z.string().optional(),
    phone: z
      .string()
      .min(11, { message: "Phone must be at least 11 digits long" })
      .max(11, { message: "Phone must be at most 11 digits long" })
      .optional(),
    memberTypeId: z.coerce.number({
      required_error: "Member type id is required",
      invalid_type_error: "Member type id must be number",
    }),
    address: z
      .string({
        invalid_type_error: "Address must be string",
      })
      .optional(),
    bio: z
      .string({
        invalid_type_error: "Bio must be string",
      })
      .optional(),
    status: z.nativeEnum(Status).optional(),
    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be string",
      })
      .min(6),
    passwordConfirm: z.string({
      required_error: "Password confirm is required",
      invalid_type_error: "Password confirm must be string",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  })
  .refine((data) => {
    if (data.email !== undefined) {
      return z
        .string({
          required_error: "Phone is required",
          invalid_type_error: "Phone must be string",
        })
        .min(10, {
          message: "Phone must be at least 10 characters",
        })
        .max(15, {
          message: "Phone must be at most 15 characters",
        });
    }
    if (data.phone !== undefined) {
      return z
        .string({
          required_error: "Email is required",
          invalid_type_error: "Email must be string",
        })
        .email({ message: "Invalid email address" });
    }
  });

export const updateMemberSchema = z
  .object({
    name: z
      .string({
        invalid_type_error: "Name must be string",
      })
      .optional(),
    email: z
      .string({
        invalid_type_error: "Email must be string",
      })
      .email({ message: "Invalid email address" })
      .optional(),
    phone: z
      .string({
        invalid_type_error: "Phone must be string",
      })
      .min(10, {
        message: "Phone must be at least 10 characters",
      })
      .max(15, {
        message: "Phone must be at most 15 characters",
      })
      .optional(),
    memberTypeId: z.coerce
      .number({
        invalid_type_error: "Member type must be number",
      })
      .optional(),
    address: z
      .string({
        invalid_type_error: "Address must be string",
      })
      .optional(),
    bio: z
      .string({
        invalid_type_error: "Bio must be string",
      })
      .optional(),
    status: z.nativeEnum(Status).optional(),
    password: z
      .string({
        invalid_type_error: "Password must be string",
      })
      .min(6, {
        message: "Password must be at least 6 characters",
      })
      .optional(),
    passwordConfirm: z
      .string({
        invalid_type_error: "Password confirm must be string",
      })
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
