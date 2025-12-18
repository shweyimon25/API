import z from "zod";
import { Status } from "@prisma/client";

export const createMealSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  cal: z.number().min(0).optional(),
  carb: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  mealTypeId: z.number({
    required_error: "Meal type ID is required",
    invalid_type_error: "Meal type ID must be a number",
  }),
  status: z.nativeEnum(Status).optional(),
});

export const updateMealSchema = z.object({
  name: z.string().optional(),
  cal: z.number().min(0).optional(),
  carb: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  mealTypeId: z.number().optional(),
  status: z.nativeEnum(Status).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;

