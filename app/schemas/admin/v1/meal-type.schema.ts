import z from "zod";
import { Status } from "@prisma/client";

export const createMealTypeSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateMealTypeSchema = z.object({
  name: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateMealTypeInput = z.infer<typeof createMealTypeSchema>;
export type UpdateMealTypeInput = z.infer<typeof updateMealTypeSchema>;

