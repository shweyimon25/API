import z from "zod";
import { Status } from "@prisma/client";

export const createMealTypeSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateMealTypeSchema = z.object({
  name: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateMealTypeInput = z.infer<typeof createMealTypeSchema>;
export type UpdateMealTypeInput = z.infer<typeof updateMealTypeSchema>;

