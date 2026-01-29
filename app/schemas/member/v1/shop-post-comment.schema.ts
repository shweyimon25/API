import { z } from "zod";

export const createShopPostCommentSchema = z.object({
    shopPostId: z.coerce.number().min(1, { message: "Shop post is required" }),
    comment: z.string().min(1, { message: "Comment is required" }),
    parentId: z.coerce.number().min(1).optional(),
});

export const updateShopPostCommentSchema = z.object({
    comment: z.string().min(1, { message: "Comment is required" }),
});

export type CreateShopPostCommentInput = z.infer<typeof createShopPostCommentSchema>;
export type UpdateShopPostCommentInput = z.infer<typeof updateShopPostCommentSchema>;
