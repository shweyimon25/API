import { z } from "zod";

export const checkMemberSocialPostReactSchema = z.object({
    react_id: z.coerce.string("React id is required"),
    social_post_id: z.coerce.string("Social post id required"),
    type: z.enum(['social','shop','comment']),
});

export type CheckMemberSocialPostReactInput = z.infer<
  typeof checkMemberSocialPostReactSchema
>;
