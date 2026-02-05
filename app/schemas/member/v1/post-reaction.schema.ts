import { z } from "zod";

export const createPostReactionSchema = z.object({
  postId: z.coerce.number().min(1, { message: "Post is required" }),
});

export type CreatePostReactionInput = z.infer<typeof createPostReactionSchema>;
