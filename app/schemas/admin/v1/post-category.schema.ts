import z from "zod";
import { Status } from "@prisma/client";

export const createPostCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export const updatePostCategorySchema = z.object({
  name: z.string().optional(),
});

export type CreatePostCategoryInput = z.infer<typeof createPostCategorySchema>;
export type UpdatePostCategoryInput = z.infer<typeof updatePostCategorySchema>;
