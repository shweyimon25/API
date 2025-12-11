import z from "zod";
import { Status } from "@prisma/client";

export const createUserSchema = z
  .object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
      })
      .email({ message: "Invalid email address" }),
    username: z.string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    }),
    roleId: z.coerce.number({
      required_error: "Role is required",
      invalid_type_error: "Role must be a number",
    }),
    status: z.nativeEnum(Status).optional(),
    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .min(6, { message: "Password is minimum 6 characters" }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

export const updateUserSchema = z
  .object({
    name: z.string().optional(),
    username: z.string().optional(),
    email: z
      .string()
      .email()
      .email({ message: "Invalid email address" })
      .optional(),
    roleId: z.number().optional(),
    status: z.nativeEnum(Status).optional(),
    password: z
      .string()
      .min(6, { message: "Password is minimum 6 characters" })
      .optional(),
    passwordConfirm: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      if (!data.passwordConfirm) return true;
      return data.password === data.passwordConfirm;
    },
    {
      message: "Passwords don't match",
      path: ["passwordConfirm"],
    }
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
