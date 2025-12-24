import { PrivencyType } from "@prisma/client";
import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1, { message: "Content is required" }).optional(),
  tagId: z.coerce.number().min(1, { message: "Tag is required" }),
  privencyType: z
    .nativeEnum(PrivencyType, {
      message: "Privency type must be PUBLIC | PRIVATE | FRIEND",
    })
    .default("PUBLIC"),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Content is required" })
    .optional(),
  tagId: z.coerce.number().optional(),
  privencyType: z
    .nativeEnum(PrivencyType, {
      message: "Privency type must be PUBLIC | PRIVATE | FRIEND",
    })
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
