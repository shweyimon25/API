import z from "zod";
import { Status } from "@prisma/client";

export const createBadHabitSchema = z.object({
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }),
  photo: z.string().url().optional().or(z.literal("")),
  status: z.nativeEnum(Status).optional(),
});

export const updateBadHabitSchema = z.object({
  description: z.string().optional(),
  photo: z.string().url().optional().or(z.literal("")),
  status: z.nativeEnum(Status).optional(),
});

export type CreateBadHabitInput = z.infer<typeof createBadHabitSchema>;
export type UpdateBadHabitInput = z.infer<typeof updateBadHabitSchema>;

