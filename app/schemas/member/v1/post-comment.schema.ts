import { z } from "zod";

export const createPostCommentSchema = z.object({
  postId: z.coerce.number().min(1, { message: "Post is required" }),
  comment: z.string().min(1, { message: "Comment is required" }),
  parentId: z.coerce.number().min(1).optional(),
});

export const updatePostCommentSchema = z.object({
  comment: z.string().min(1, { message: "Comment is required" }),
});

export const createPostCommentReactionSchema = z.object({
  postCommentId: z.coerce.number().min(1, { message: "Post comment is required" }),
  reaction: z.string().min(1, { message: "Reaction is required" }),
});

export const deletePostCommentReactionSchema = z.object({
  postCommentId: z.coerce.number().min(1, { message: "Post comment is required" }),
});

export type CreatePostCommentInput = z.infer<typeof createPostCommentSchema>;
export type UpdatePostCommentInput = z.infer<typeof updatePostCommentSchema>;
export type CreatePostCommentReactionInput = z.infer<typeof createPostCommentReactionSchema>;
export type DeletePostCommentReactionInput = z.infer<typeof deletePostCommentReactionSchema>;



