import { PrivencyType } from "@prisma/client";
import z from "zod";

export const createPostSchema = z.object({
  contact: z.string({
    message: "Contact must be string",
  }).optional(),
  tagId: z.coerce.number({
    required_error: "Tag id is required",
    invalid_type_error: "Tag id must be number",
  }),
  privencyType: z.nativeEnum(PrivencyType, {
    invalid_type_error: "Privency type must be either PUBLIC or PRIVATE",
  }).optional()
});

export const updatePostSchema = z.object({
  contact: z.any().optional(),
  tagId: z.coerce.number().optional(),
  privencyType: z.nativeEnum(PrivencyType, {
    invalid_type_error: "Privency type must be either PUBLIC or PRIVATE",
  }).optional()
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

