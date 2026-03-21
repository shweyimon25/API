import { z } from "zod";

export const createMealTrackerSchema = z.object({
    mealId: z.coerce.number().min(1, { message: "Meal is required" }),
    date: z.string().min(1, { message: "Date is required" }), // e.g. 2026-03-13
    quantity: z.coerce.number().min(1).default(1),
});

export const updateMealTrackerSchema = z.object({
    quantity: z.coerce.number().min(1).optional(),
});

export type CreateMealTrackerInput = z.infer<typeof createMealTrackerSchema>;
export type UpdateMealTrackerInput = z.infer<typeof updateMealTrackerSchema>;

