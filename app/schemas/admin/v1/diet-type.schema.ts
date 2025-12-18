import z from "zod";
import { Status } from "@prisma/client";

export const createDietTypeSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  photo: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export const updateDietTypeSchema = z.object({
  name: z.string().optional(),
  photo: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateDietTypeInput = z.infer<typeof createDietTypeSchema>;
export type UpdateDietTypeInput = z.infer<typeof updateDietTypeSchema>;

