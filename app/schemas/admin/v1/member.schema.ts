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
    providerTypes: z
      .array(z.nativeEnum(ProviderType), {
        required_error: "Provider types are required",
        invalid_type_error: "Provider types must be an array",
      })
      .min(1, { message: "At least one provider type is required" }),
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
    providerTypes: z
      .array(z.nativeEnum(ProviderType), {
        invalid_type_error: "Provider types must be an array of valid provider types",
      })
      .min(1, { message: "At least one provider type is required" })
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
