import z from "zod";

const privencyTypeEnum = z.enum(["PUBLIC", "PRIVATE", "FRIEND"]);

export const createPostSchema = z.object({
  contact: z.any().optional(),
  tagId: z.coerce.number({
    required_error: "Tag id is required",
    invalid_type_error: "Tag id must be number",
  }),
  privencyType: privencyTypeEnum.optional(),
  media: z.any().optional(),
});

export const updatePostSchema = z.object({
  contact: z.any().optional(),
  tagId: z.coerce.number().optional(),
  privencyType: privencyTypeEnum.optional(),
  media: z.any().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

