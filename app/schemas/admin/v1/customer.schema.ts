import z from "zod";
import prisma from "../../../../prisma/client";

export const createCustomerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .refine(
        async (arg) => {
          const result = await prisma.customer.findFirst({
            where: { name: arg },
          });
          return !result;
        },
        {
          message: "Name is already exist",
        }
      ),
    email: z.string().email().min(1, { message: "Email is required" }),
    phone: z
      .string({
        required_error: "Phone is required",
        invalid_type_error: "Phone must be a string",
      })
      .min(8, { message: "Invalid phone number" })
      .max(15, { message: "Invalid phone number" })
      .refine((arg) => /^\d+$/.test(arg), {
        message: "Phone must be a number",
      })
      .refine(
        async (arg) => {
          const result = await prisma.customer.findFirst({
            where: { phone: arg },
          });
          return !result;
        },
        {
          message: "Phone is already exist",
        }
      ),
    bio: z.string().optional(),
    language: z.enum(["en", "thai"]).default("en").optional(),
    avatar: z.string().optional(),
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

export const updateCustomerSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z
      .string({
        invalid_type_error: "Phone must be a string",
      })
      .min(8, { message: "Invalid phone number" })
      .max(15, { message: "Invalid phone number" })
      .refine((arg) => /^\d+$/.test(arg), {
        message: "Phone must be a number",
      })
      .optional(),
    bio: z.string().optional(),
    language: z.enum(["en", "thai"]).default("en").optional(),
    avatar: z.string().optional(),
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

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
