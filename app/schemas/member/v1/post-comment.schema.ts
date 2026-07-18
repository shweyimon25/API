import { z } from "zod";

export const createPostCommentSchema = z.object({
      "name": z.string("Name").min(1, ""),
    "mentioned_users": "",
    // "social_post_id": 10,
    "shop_post_id": 6,
    "parent_command_id": null
});

export const updatePostCommentSchema = z.object({
  comment: z.string().min(1, { message: "Comment is required" }),
});

export const createPostCommentReactionSchema = z.object({
  postCommentId: z.coerce
    .number()
    .min(1, { message: "Post comment is required" }),
  reaction: z.string().min(1, { message: "Reaction is required" }),
});

export const deletePostCommentReactionSchema = z.object({
  postCommentId: z.coerce
    .number()
    .min(1, { message: "Post comment is required" }),
});

export type CreatePostCommentInput = z.infer<typeof createPostCommentSchema>;
export type UpdatePostCommentInput = z.infer<typeof updatePostCommentSchema>;
export type CreatePostCommentReactionInput = z.infer<
  typeof createPostCommentReactionSchema
>;
export type DeletePostCommentReactionInput = z.infer<
  typeof deletePostCommentReactionSchema
>;
