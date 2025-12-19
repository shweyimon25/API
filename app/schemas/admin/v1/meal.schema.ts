import z from "zod";
import { Status } from "@prisma/client";

export const createMealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cal: z.coerce.number().optional().default(0.00),
  carb: z.coerce.number().optional().default(0.00),
  protein: z.coerce.number().optional().default(0.00),
  fat: z.coerce.number().optional().default(0.00),
  mealTypeId: z.coerce.number({
    required_error: "Meal type is required",
    invalid_type_error: "Meal type must be a number",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateMealSchema = z.object({
  name: z.string().optional(),
  cal: z.coerce.number().optional(),
  carb: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
  mealTypeId: z.coerce.number().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
