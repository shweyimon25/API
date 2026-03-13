import z from "zod";
import { Status } from "@prisma/client";

export const createMealSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  cal: z.coerce.number().optional().default(0.00),
  carb: z.coerce.number().optional().default(0.00),
  protein: z.coerce.number().optional().default(0.00),
  fat: z.coerce.number().optional().default(0.00),
  mealType: z.string().min(1, { message: "Meal type is required" }),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateMealSchema = z.object({
  name: z.string().optional(),
  cal: z.coerce.number().optional(),
  carb: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
  mealType: z.string().optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
