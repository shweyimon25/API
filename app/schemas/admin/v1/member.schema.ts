import { z } from "zod";
import { Gender, Status } from "@prisma/client";

export const createMemberSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email({
      message: "Invalid email address",
    }),
    phone: z
      .string()
      .min(1, { message: "Phone is required" })
      .min(9, {
        message: "Phone must be at least 9 digits long",
      })
      .max(15, {
        message: "Phone must be at most 15 digits long",
      }),
    appleId: z
      .string()
      .optional(),
    address: z
      .string().optional(),
    bio: z
      .string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.BOTH], { message: "Gender must be MALE | FEMALE | BOTH" }).optional(),
    age: z.coerce.number().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        }
      ),
    passwordConfirm: z.string().min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
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
    appleId: z
      .string()
      .optional(),
    address: z
      .string()
      .optional(),
    bio: z
      .string()
      .optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.BOTH], { message: "Gender must be MALE | FEMALE | BOTH" }).optional(),
    age: z.coerce.number().optional(),
    status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
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
  );

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
