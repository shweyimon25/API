import { z } from "zod";


export const createShopPostSchema = z.object({
    caption: z.string({
        message: "Caption is required"
    }),
    shopId: z.coerce.number().min(1, { message: "Shop is required" }),
});

export const updateShopPostSchema = z.object({
    caption: z.string().min(1, { message: "Caption is required" }).optional(),
});

export type CreateShopPostInput = z.infer<typeof createShopPostSchema>;
export type UpdateShopPostInput = z.infer<typeof updateShopPostSchema>;

