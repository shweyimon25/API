import z from "zod";
import { Status } from "@prisma/client";

export const createUserSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    username: z.string()
      .min(1, { message: "Username is required" })
      .refine((val) => !val.includes(" "), { message: "Username must not contain spaces" }),
    roleId: z.coerce.number().min(1, { message: "Role is required" }),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
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
  });

export const updateUserSchema = z
  .object({
    name: z.string().optional(),
    username: z.string()
      .refine((val) => !val || !val.includes(" "), { message: "Username must not contain spaces" })
      .optional(),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .optional(),
    roleId: z.coerce.number().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        }
      ).optional(),
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
