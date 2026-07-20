import { z } from "zod";

export const memberSocialPostCommentCreateSchema = z
  .object({
    name: z.string("Name is required").min(1, "Name is required"),
    mention_member_ids: z.array(z.coerce.number()).optional(),
    social_post_id: z.coerce.string().optional(),
    shop_post_id: z.coerce.string().optional(),
    parent_command_id: z.coerce.string().optional()
  })
  .refine((data) => data.social_post_id || data.shop_post_id, {
    message: "Either social_post_id or shop_post_id is required",
    path: ["social_post_id"],
  });

export const memberSocialPostCommentUpdateSchema = z.object({
  name: z.string("Name is required").min(1, "Name is required"),
  mention_member_ids: z.array(z.coerce.number()).optional()
});

export type MemberSocialPostCommentCreate = z.infer<
  typeof memberSocialPostCommentCreateSchema
>;
export type MemberSocialPostCommentUpdate = z.infer<
  typeof memberSocialPostCommentUpdateSchema
>;
