import { z } from "zod";

const mentionIdSchema = z.object({
  partner_id: z.coerce.number(),
  partner_name: z.string(),
  user_id: z.coerce.number(),
});

export const memberSocialPostCommentCreateSchema = z
  .object({
    name: z.string("Name is required").min(1, "Name is required"),
    mentioned_users: z.string().optional(),
    mention_ids: z.array(mentionIdSchema).optional(),
    social_post_id: z.coerce.string().optional(),
    shop_post_id: z.coerce.string().optional(),
    parent_command_id: z.coerce.string().optional(),
  })
  .refine((data) => data.social_post_id || data.shop_post_id, {
    message: "Either social_post_id or shop_post_id is required",
    path: ["social_post_id"],
  });

export const memberSocialPostCommentUpdateSchema = z.object({
  name: z.string("Name is required").min(1, "Name is required"),
  mentioned_users: z.string().optional(),
  mention_ids: z.array(mentionIdSchema).optional(),
  parent_command_id: z.coerce.string().optional(),
});

export type MemberSocialPostCommentCreate = z.infer<
  typeof memberSocialPostCommentCreateSchema
>;
export type MemberSocialPostCommentUpdate = z.infer<
  typeof memberSocialPostCommentUpdateSchema
>;
