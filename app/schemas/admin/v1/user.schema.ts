import z from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(1, { message: "Email is required" }),
    roleId: z.number({
      required_error: "Role is required",
      invalid_type_error: "Role must be a number",
    }),
    status: z.boolean().optional(),
    password: z
      .string()
      .min(8, { message: "Password is minimum 8 characters" }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  });

export const updateUserSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    roleId: z.number().optional(),
    status: z.boolean().optional(),
    password: z.string().optional(),
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
