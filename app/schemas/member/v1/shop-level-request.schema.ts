import { z } from "zod";

export const shopLevelRequestSchema = z.object({
    shopLevelId: z.coerce.number({
        message: "Shop level is required",
    })
});

export type ShopLevelRequestInput = z.infer<typeof shopLevelRequestSchema>;