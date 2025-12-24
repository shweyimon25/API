import z from "zod";
import { Status } from "@prisma/client";

export const createDietTypeSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateDietTypeSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateDietTypeInput = z.infer<typeof createDietTypeSchema>;
export type UpdateDietTypeInput = z.infer<typeof updateDietTypeSchema>;
