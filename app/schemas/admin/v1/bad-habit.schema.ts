import z from "zod";
import { Status } from "@prisma/client";

export const createBadHabitSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateBadHabitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateBadHabitInput = z.infer<typeof createBadHabitSchema>;
export type UpdateBadHabitInput = z.infer<typeof updateBadHabitSchema>;

