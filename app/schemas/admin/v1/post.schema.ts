import { PrivencyType } from "@prisma/client";
import z from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1, { message: "Content is required" }).optional(),
  tagId: z.coerce.number().min(1, { message: "Tag is required" }),
  memberId: z.coerce.number().min(1, { message: "Member is required" }),
  privencyType: z.enum([PrivencyType.PUBLIC, PrivencyType.PRIVATE, PrivencyType.FRIEND], { message: "Privency type must be PUBLIC or PRIVATE or FRIEND" }).optional()
});

export const updatePostSchema = z.object({
  content: z.string().optional(),
  tagId: z.coerce.number().optional(),
  privencyType: z.enum([PrivencyType.PUBLIC, PrivencyType.PRIVATE, PrivencyType.FRIEND], { message: "Privency type must be PUBLIC or PRIVATE or FRIEND" }).optional()
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

