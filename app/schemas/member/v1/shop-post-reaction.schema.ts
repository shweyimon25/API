import { z } from "zod";

export const createShopPostReactionSchema = z.object({
    shopPostId: z.coerce.number().min(1, { message: "Shop post is required" }),
});

export type CreateShopPostReactionInput = z.infer<typeof createShopPostReactionSchema>;
