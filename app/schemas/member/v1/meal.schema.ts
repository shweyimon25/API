import { z } from "zod";

export const listMealSchema = z.object({
    name: z.string().optional(),
    mealTypeId: z.coerce.number().optional(),
});

export type ListMealInput = z.infer<typeof listMealSchema>;