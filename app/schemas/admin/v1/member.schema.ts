import { ProviderType } from "@prisma/client";
import { z } from "zod";
import { email, minLength } from "zod/v4";

export const createMemberSchema = z
  .object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be string",
    }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be string",
      })
      .email({ message: "Invalid email address" }),
    username: z.string({
      required_error: "Username is required",
      invalid_type_error: "Username must be string",
    }),
    memberTypeId: z.coerce.number({
      required_error: "Member type id is required",
      invalid_type_error: "Member type id must be number",
    }),
    providerType: z.nativeEnum(ProviderType, {
      required_error: "Provider type is required",
      invalid_type_error: "Provider type must be a valid provider type",
    }),
    status: z.boolean().optional(),
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
  });

export const updateMemberSchema = z
  .object({
    name: z
      .string({
        invalid_type_error: "Name must be string",
      })
      .optional(),
    email: z.string().email("Invalid email address").optional(),
    username: z
      .string({
        invalid_type_error: "Username must be string",
      })
      .optional(),
    memberTypeId: z.coerce
      .number({
        invalid_type_error: "Member type must be number",
      })
      .optional(),
    providerType: z
      .nativeEnum(ProviderType, {
        invalid_type_error: "Provider type must be a valid provider type",
      })
      .optional(),
    status: z.boolean().optional(),
    password: z
      .string({
        invalid_type_error: "Password must be string",
      })
      .min(6)
      .optional(),
    passwordConfirm: z
      .string({
        invalid_type_error: "Password confirm must be string",
      })
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
