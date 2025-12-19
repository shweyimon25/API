import z from "zod";
import { Status } from "@prisma/client";

export const createDietTypeSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export const updateDietTypeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateDietTypeInput = z.infer<typeof createDietTypeSchema>;
export type UpdateDietTypeInput = z.infer<typeof updateDietTypeSchema>;
