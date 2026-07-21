import { z } from "zod";

export const checkMemberSocialPostReactSchema = z.object({
  react_id: z.coerce.string("React id is required"),
  type: z.enum(['social', 'shop', 'comment']),
  shop_post_id: z.coerce.string().optional(),
  social_post_id: z.coerce.string().optional(),
  comment_id: z.coerce.string().optional(),
}).refine((data) => {
  if (data.type === 'social') {
    return data.social_post_id !== undefined;
  }
  if (data.type === 'shop') {
    return data.shop_post_id !== undefined;
  }
  if (data.type === 'comment') {
    return data.comment_id !== undefined;
  }
  return true;
}, { message: "Either social_post_id, shop_post_id or comment_id is required" });

export type CheckMemberSocialPostReactInput = z.infer<
  typeof checkMemberSocialPostReactSchema
>;
