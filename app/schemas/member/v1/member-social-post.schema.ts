import { z } from "zod";

export const memberSocialPostCreateSchema = z.object({
  caption: z.string().optional(),
  view_type: z.enum(["public", "friend", "only_me"]),
  post_category: z
    .string("Post category is required.")
    .min(1, "Post category is required."),
});

export const memberSocialSharePostCreateSchema = z.object({
  caption: z.string().optional(),
  post_category: z
    .string("Post category is required.")
    .min(1, "Post category is required."),
  view_type: z.enum(["public", "friend", "only_me"]),
  share_post_id: z.coerce.string("Share post id is required"),
});

export const memberSocialPostUpdateSchema = z.object({
  caption: z
    .string()
    .optional(),
  view_type: z.enum(["public", "friend", "only_me"]).optional(),
  post_category: z
    .string("Post category is required.")
    .min(1, "Post category is required.")
    .optional(),
});

export const memberPostSaveCreateSchema = z.object({
  social_post_id: z.coerce.string("Post id is required"),
});

export type MemberSocialPostCreate = z.infer<
  typeof memberSocialPostCreateSchema
>;
export type MemberSocialPostUpdate = z.infer<
  typeof memberSocialPostUpdateSchema
>;
export type MemberSocialPostSaveCreate = z.infer<
  typeof memberPostSaveCreateSchema
>;
