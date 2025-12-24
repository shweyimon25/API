import z from "zod";
import { Status } from "@prisma/client";

export const createMealSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  cal: z.coerce.number().optional().default(0.00),
  carb: z.coerce.number().optional().default(0.00),
  protein: z.coerce.number().optional().default(0.00),
  fat: z.coerce.number().optional().default(0.00),
  mealTypeId: z.coerce.number().min(1, { message: "Meal type is required" }),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export const updateMealSchema = z.object({
  name: z.string().optional(),
  cal: z.coerce.number().optional(),
  carb: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
  mealTypeId: z.coerce.number().optional(),
  status: z.nativeEnum(Status, { message: "Status must be ACTIVE | INACTIVE" }).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
