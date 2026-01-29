import { z } from "zod";

export const createShopRatingSchema = z.object({
    shopId: z.coerce.number().min(1, { message: "Shop is required" }),
    rate: z.coerce.number().int().min(1, { message: "Rate must be between 1 and 5" }).max(5, { message: "Rate must be between 1 and 5" }),
    review: z.string().optional(),
});

export const updateShopRatingSchema = z.object({
    shopId: z.coerce.number().optional(),
    rate: z.coerce.number().int().min(1, { message: "Rate must be between 1 and 5" }).max(5, { message: "Rate must be between 1 and 5" }).optional(),
    review: z.string().optional(),
});

export type CreateShopRatingInput = z.infer<typeof createShopRatingSchema>;
export type UpdateShopRatingInput = z.infer<typeof updateShopRatingSchema>;