import z from "zod";
import { Status } from "@prisma/client";

export const createBadHabitSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateBadHabitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateBadHabitInput = z.infer<typeof createBadHabitSchema>;
export type UpdateBadHabitInput = z.infer<typeof updateBadHabitSchema>;

